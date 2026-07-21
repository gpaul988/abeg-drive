import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserByPhone, createOtp } from "@/lib/repositories/userRepository";
import { generateOtpCode } from "@/lib/auth";
import { sendOtpSms } from "@/lib/providers/sms";

const schema = z.object({ phone: z.string().min(10) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }

  const user = await findUserByPhone(parsed.data.phone);
  // Always return 200 regardless of whether the phone exists, to avoid
  // leaking which numbers are registered.
  if (user) {
    const code = generateOtpCode();
    await createOtp(parsed.data.phone, code, 5 * 60 * 1000);
    await sendOtpSms(parsed.data.phone, code);
  }

  return NextResponse.json({ sent: true });
}
