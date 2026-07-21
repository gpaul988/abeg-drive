import { NextResponse } from "next/server";
import { getBearerToken, verifyAccessToken } from "./auth";
import { findUserById } from "./repositories/userRepository";
import { BaseUser } from "./types";

export async function requireUser(
  req: Request
): Promise<{ user: BaseUser } | { error: NextResponse }> {
  const token = getBearerToken(req);
  if (!token) {
    return { error: NextResponse.json({ error: "missing_bearer_token" }, { status: 401 }) };
  }
  const payload = verifyAccessToken(token);
  if (!payload) {
    return { error: NextResponse.json({ error: "invalid_or_expired_token" }, { status: 401 }) };
  }
  const user = await findUserById(payload.sub);
  if (!user) {
    return { error: NextResponse.json({ error: "user_not_found" }, { status: 404 }) };
  }
  return { user };
}
