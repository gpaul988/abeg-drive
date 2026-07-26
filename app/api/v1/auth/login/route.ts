import { NextResponse } from "next/server";
import { verify as verifyTotp } from "otplib";
import { loginSchema } from "@/lib/validation";
import { findUserByPhone, findUserByEmail, storeRefreshToken, updateUser } from "@/lib/repositories/userRepository";
import { verifyPassword, signAccessToken, generateRefreshToken, REFRESH_TOKEN_TTL } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rateLimit";

const INTERNAL_ROLES = ["platform_admin", "security_agent", "super_admin"];

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: Request) {
  // Per-IP limit across all login attempts, regardless of which account is
  // targeted — stops a single attacker from brute-forcing many accounts
  // from one source, which per-account lockout alone wouldn't catch.
  const rateLimitResponse = enforceRateLimit(req, "login", 20, 15 * 60 * 1000);
  if (rateLimitResponse) return rateLimitResponse;

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }
  const { identifier, password, totpCode } = parsed.data;

  const user = identifier.includes("@")
    ? await findUserByEmail(identifier)
    : await findUserByPhone(identifier);

  if (!user) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  // Account lockout — closes a real gap where there was previously no
  // brute-force protection on a specific account at all.
  if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
    const retryAfterSeconds = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 1000);
    return NextResponse.json(
      { error: "account_locked", retryAfterSeconds },
      { status: 423, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    const patch: { failedLoginAttempts: number; lockedUntil?: string } = { failedLoginAttempts };
    if (failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      patch.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
    }
    await updateUser(user.id, patch);
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  // 2FA (TOTP) is mandatory for every internal/admin-tier role, per spec
  // section 3.7 ("/admin/login with 2FA mandatory") and section 7. There is
  // no bypass path — an internal account without a totpSecret provisioned
  // cannot log in at all, rather than silently skipping the check.
  if (INTERNAL_ROLES.includes(user.role)) {
    if (!user.totpSecret) {
      return NextResponse.json({ error: "2fa_not_provisioned_contact_super_admin" }, { status: 403 });
    }
    if (!totpCode) {
      return NextResponse.json({ error: "totp_code_required", requiresTotp: true }, { status: 401 });
    }
    const result = await verifyTotp({ secret: user.totpSecret, token: totpCode });
    if (!result.valid) {
      return NextResponse.json({ error: "invalid_totp_code" }, { status: 401 });
    }
  }

  // Successful login resets the lockout counter.
  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await updateUser(user.id, { failedLoginAttempts: 0, lockedUntil: undefined });
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(refreshToken, user.id, REFRESH_TOKEN_TTL, req.headers.get("user-agent") ?? undefined);

  return NextResponse.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      role: user.role,
      verificationStatus: user.verificationStatus,
      onboardingComplete: Boolean(user.otpVerifiedAt && user.identityVerifiedAt && user.paymentMethodAddedAt),
    },
  });
}
