import { NextResponse } from "next/server";
import { refreshTokenSchema } from "@/lib/validation";
import {
  findRefreshTokenRecord,
  revokeRefreshToken,
  revokeAllRefreshTokensForUser,
  storeRefreshToken,
  findUserById,
} from "@/lib/repositories/userRepository";
import { signAccessToken, generateRefreshToken, REFRESH_TOKEN_TTL } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const rateLimitResponse = enforceRateLimit(req, "refresh-token", 30, 15 * 60 * 1000);
  if (rateLimitResponse) return rateLimitResponse;

  const body = await req.json().catch(() => null);
  const parsed = refreshTokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const record = await findRefreshTokenRecord(parsed.data.refreshToken);
  if (!record) {
    return NextResponse.json({ error: "invalid_or_expired_refresh_token" }, { status: 401 });
  }

  // Reuse detection: this exact token was already used once (rotation
  // revokes it — see below) and is being presented again. That's either a
  // client retry race or, more concerningly, a sign the token was stolen
  // and both the legitimate holder and an attacker are using it. Either
  // way, the safe response is to kill every active session for this user
  // and require a fresh login, rather than silently issuing more tokens.
  if (record.revokedAt) {
    await revokeAllRefreshTokensForUser(record.userId);
    return NextResponse.json({ error: "refresh_token_reuse_detected_all_sessions_revoked" }, { status: 401 });
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "invalid_or_expired_refresh_token" }, { status: 401 });
  }

  const user = await findUserById(record.userId);
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  // Rotation: the presented refresh token is single-use. Revoke it and
  // issue a new one alongside the new access token, so a leaked refresh
  // token is only useful until its next legitimate use.
  await revokeRefreshToken(parsed.data.refreshToken);
  const newRefreshToken = generateRefreshToken();
  await storeRefreshToken(newRefreshToken, user.id, REFRESH_TOKEN_TTL, req.headers.get("user-agent") ?? undefined);

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  return NextResponse.json({ accessToken, refreshToken: newRefreshToken });
}
