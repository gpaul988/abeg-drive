import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { getCustomerProfile } from "@/lib/repositories/userRepository";

export async function GET(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const profile = user.role === "customer" ? await getCustomerProfile(user.id) : undefined;

  return NextResponse.json({
    id: user.id,
    phone: user.phone,
    email: user.email,
    role: user.role,
    verificationStatus: user.verificationStatus,
    onboardingComplete: Boolean(user.otpVerifiedAt && user.emailVerifiedAt && user.identityVerifiedAt && user.paymentMethodAddedAt),
    profile,
  });
}
