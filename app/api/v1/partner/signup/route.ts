import { NextResponse } from "next/server";
import { z } from "zod";
import { strongPasswordSchema } from "@/lib/validation";
import { createUser, findUserByEmail, findUserByPhone, storeRefreshToken } from "@/lib/repositories/userRepository";
import { createVenuePartner } from "@/lib/repositories/venueRepository";
import { hashPassword, signAccessToken, generateRefreshToken, REFRESH_TOKEN_TTL } from "@/lib/auth";

const schema = z.object({
  venueName: z.string().min(2),
  address: z.string().min(5),
  contactPerson: z.string().min(2),
  contactPhone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),
  adminEmail: z.string().email(),
  adminPassword: strongPasswordSchema,
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }
  const { venueName, address, contactPerson, contactPhone, adminEmail, adminPassword } = parsed.data;

  if (await findUserByEmail(adminEmail)) {
    return NextResponse.json({ error: "email_already_registered" }, { status: 409 });
  }
  if (await findUserByPhone(contactPhone)) {
    return NextResponse.json({ error: "phone_already_registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(adminPassword);
  const user = await createUser({ phone: contactPhone, email: adminEmail, passwordHash, role: "venue_partner" });
  // Starts un-whitelisted — Phase 1 launch strategy (spec section 1) requires
  // manual ops approval before a venue can request drivers on behalf of guests.
  const venue = await createVenuePartner({ ownerUserId: user.id, venueName, address, contactPerson, contactPhone });

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(refreshToken, user.id, REFRESH_TOKEN_TTL);

  return NextResponse.json({ accessToken, refreshToken, venueId: venue.id }, { status: 201 });
}
