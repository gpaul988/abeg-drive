import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { findUserByPhone, findUserByEmail, storeRefreshToken } from "@/lib/repositories/userRepository";
import { verifyPassword, signAccessToken, generateRefreshToken, REFRESH_TOKEN_TTL } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }
  const { identifier, password } = parsed.data;

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
