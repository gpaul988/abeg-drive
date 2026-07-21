import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeOtp, findUserByPhone, updateUser } from "@/lib/repositories/userRepository";
import { hashPassword } from "@/lib/auth";

const schema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const ok = await consumeOtp(parsed.data.phone, parsed.data.code);
  if (!ok) {
    return NextResponse.json({ error: "invalid_or_expired_otp" }, { status: 400 });
  }

  const user = await findUserByPhone(parsed.data.phone);
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await updateUser(user.id, { passwordHash });

  return NextResponse.json({ success: true });
}
