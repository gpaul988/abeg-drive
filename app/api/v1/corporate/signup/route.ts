import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser, findUserByEmail, findUserByPhone, storeRefreshToken } from "@/lib/repositories/userRepository";
import { createCorporateAccount } from "@/lib/repositories/corporateRepository";
import { hashPassword, signAccessToken, generateRefreshToken, REFRESH_TOKEN_TTL } from "@/lib/auth";

// B2B signup is a single step, unlike the consumer funnel (no OTP/NIN/
// selfie) — corporate accounts are vetted via RC number + billing
// relationship rather than individual identity verification, consistent
// with spec section 1's framing of corporate accounts as an anchor
// revenue segment with a different trust model than anonymous consumers.
const schema = z.object({
  companyName: z.string().min(2),
  rcNumber: z.string().min(3, "Enter a valid RC number"),
  billingContact: z.string().email(),
  adminEmail: z.string().email(),
  adminPhone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),
  adminPassword: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }
  const { companyName, rcNumber, billingContact, adminEmail, adminPhone, adminPassword } = parsed.data;

  if (await findUserByEmail(adminEmail)) {
    return NextResponse.json({ error: "email_already_registered" }, { status: 409 });
  }
  if (await findUserByPhone(adminPhone)) {
    return NextResponse.json({ error: "phone_already_registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(adminPassword);
  const user = await createUser({ phone: adminPhone, email: adminEmail, passwordHash, role: "corporate_admin" });
  const account = await createCorporateAccount({ ownerUserId: user.id, companyName, rcNumber, billingContact });

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(refreshToken, user.id, REFRESH_TOKEN_TTL);

  return NextResponse.json({ accessToken, refreshToken, corporateAccountId: account.id }, { status: 201 });
}
