import { NextResponse } from "next/server";
import { refreshTokenSchema } from "@/lib/validation";
import { isRefreshTokenValid, findUserById } from "@/lib/repositories/userRepository";
import { signAccessToken } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = refreshTokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const record = await isRefreshTokenValid(parsed.data.refreshToken);
  if (!record) {
    return NextResponse.json({ error: "invalid_or_expired_refresh_token" }, { status: 401 });
  }

  const user = await findUserById(record.userId);
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  return NextResponse.json({ accessToken });
}
