import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validation";
import { createUser, findUserByPhone, findUserByEmail, createOtp } from "@/lib/repositories/userRepository";
import { hashPassword, generateOtpCode } from "@/lib/auth";
import { sendOtpSms } from "@/lib/providers/sms";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }
  const { phone, email, password, role } = parsed.data;

  if (await findUserByPhone(phone)) {
    return NextResponse.json({ error: "phone_already_registered" }, { status: 409 });
  }
  if (await findUserByEmail(email)) {
    return NextResponse.json({ error: "email_already_registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ phone, email, passwordHash, role });

  const code = generateOtpCode();
  await createOtp(phone, code, 5 * 60 * 1000); // 5 minute TTL
  await sendOtpSms(phone, code);

  return NextResponse.json(
    {
      userId: user.id,
      phone: user.phone,
      nextStep: "verify-otp",
    },
    { status: 201 }
  );
}
