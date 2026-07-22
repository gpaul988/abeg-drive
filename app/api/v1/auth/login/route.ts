import { NextResponse } from "next/server";
import { verify as verifyTotp } from "otplib";
import { loginSchema } from "@/lib/validation";
import { findUserByPhone, findUserByEmail, storeRefreshToken } from "@/lib/repositories/userRepository";
import { verifyPassword, signAccessToken, generateRefreshToken, REFRESH_TOKEN_TTL } from "@/lib/auth";

const INTERNAL_ROLES = ["platform_admin", "security_agent", "super_admin"];

export async function POST(req: Request) {
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

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
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

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(refreshToken, user.id, REFRESH_TOKEN_TTL);

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
