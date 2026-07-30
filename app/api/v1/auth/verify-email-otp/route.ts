import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserById, consumeOtp, updateUser } from "@/lib/repositories/userRepository";
import { enforceRateLimit } from "@/lib/rateLimit";

const schema = z.object({ userId: z.string().uuid(), code: z.string().length(6) });

export async function POST(req: Request) {
  const rateLimitResponse = enforceRateLimit(req, "verify-email-otp", 10, 5 * 60 * 1000);
  if (rateLimitResponse) return rateLimitResponse;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }

  const user = await findUserById(parsed.data.userId);
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  const ok = await consumeOtp(user.email, parsed.data.code);
  if (!ok) {
    return NextResponse.json({ error: "invalid_or_expired_otp" }, { status: 400 });
  }

  await updateUser(user.id, { emailVerifiedAt: new Date().toISOString() });
  return NextResponse.json({ verified: true, nextStep: "identity" });
}
