import { NextResponse } from "next/server";
import { selfieLivenessSchema } from "@/lib/validation";
import { findUserById, updateUser } from "@/lib/repositories/userRepository";
import { verifySelfieLiveness } from "@/lib/providers/kyc";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = selfieLivenessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }
  const { userId, selfieImageBase64 } = parsed.data;

  const user = await findUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }
  if (!user.ninNumber) {
    return NextResponse.json({ error: "nin_verification_required_first" }, { status: 409 });
  }

  const result = await verifySelfieLiveness(userId, selfieImageBase64);
  if (!result.match) {
    return NextResponse.json({ match: false }, { status: 422 });
  }

  await updateUser(userId, {
    selfieLivenessRef: result.livenessRef,
    verificationStatus: "verified",
    identityVerifiedAt: new Date().toISOString(),
  });

  return NextResponse.json({ match: true, nextStep: "payment-method" });
}
