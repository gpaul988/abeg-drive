import { NextResponse } from "next/server";
import { ninVerifySchema } from "@/lib/validation";
import { findUserById, updateUser } from "@/lib/repositories/userRepository";
import { verifyNin } from "@/lib/providers/kyc";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = ninVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }
  const { userId, ninNumber } = parsed.data;

  const user = await findUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  const result = await verifyNin(ninNumber);
  if (!result.verified) {
    await updateUser(userId, { verificationStatus: "rejected" });
    return NextResponse.json({ verified: false, reason: result.reason }, { status: 422 });
  }

  await updateUser(userId, { ninNumber, verificationStatus: "pending" });

  return NextResponse.json({ verified: true, nextStep: "selfie-liveness" });
}
