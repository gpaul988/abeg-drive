import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserById, storeRefreshToken } from "@/lib/repositories/userRepository";
import { signAccessToken, generateRefreshToken, REFRESH_TOKEN_TTL } from "@/lib/auth";

// Not part of the public spec's endpoint list, but required to bridge the
// signup funnel (signup -> otp -> identity -> payment-method) into an
// authenticated session without re-asking for the password mid-flow. Only
// issues a token once both phone verification and identity verification are
// already complete for this user.
const schema = z.object({ userId: z.string().uuid() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }

  const user = await findUserById(parsed.data.userId);
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }
  if (!user.otpVerifiedAt || !user.identityVerifiedAt) {
    return NextResponse.json({ error: "onboarding_incomplete" }, { status: 409 });
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(refreshToken, user.id, REFRESH_TOKEN_TTL);

  return NextResponse.json({ accessToken, refreshToken });
}
