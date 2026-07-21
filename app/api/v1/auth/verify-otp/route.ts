import { NextResponse } from "next/server";
import { verifyOtpSchema } from "@/lib/validation";
import { consumeOtp, findUserByPhone, updateUser } from "@/lib/repositories/userRepository";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }
  const { phone, code } = parsed.data;

  const ok = await consumeOtp(phone, code);
  if (!ok) {
    return NextResponse.json({ error: "invalid_or_expired_otp" }, { status: 400 });
  }

  const user = await findUserByPhone(phone);
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }
  await updateUser(user.id, { otpVerifiedAt: new Date().toISOString() });

  return NextResponse.json({ userId: user.id, nextStep: "identity" });
}
