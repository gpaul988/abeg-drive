import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { findVenuePartnerByOwner } from "@/lib/repositories/venueRepository";

export async function GET(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  if (auth.user.role !== "venue_partner") {
    return NextResponse.json({ error: "venue_partner_role_required" }, { status: 403 });
  }

  const venue = await findVenuePartnerByOwner(auth.user.id);
  if (!venue) {
    return NextResponse.json({ error: "venue_not_found" }, { status: 404 });
  }

  return NextResponse.json({ venue });
}
