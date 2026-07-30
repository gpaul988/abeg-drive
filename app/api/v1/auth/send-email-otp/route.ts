import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserById, createOtp } from "@/lib/repositories/userRepository";
import { generateOtpCode } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/providers/email";
import { enforceRateLimit } from "@/lib/rateLimit";

const schema = z.object({ userId: z.string().uuid() });

export async function POST(req: Request) {
  const rateLimitResponse = enforceRateLimit(req, "send-email-otp", 5, 15 * 60 * 1000);
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
  if (user.emailVerifiedAt) {
    return NextResponse.json({ alreadyVerified: true });
  }

  const code = generateOtpCode();
  await createOtp(user.email, code, 5 * 60 * 1000);
  await sendOtpEmail(user.email, code);

  return NextResponse.json({ sent: true, email: user.email });
}
