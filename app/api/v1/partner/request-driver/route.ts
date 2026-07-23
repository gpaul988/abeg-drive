import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/requireAuth";
import { findVenuePartnerByOwner } from "@/lib/repositories/venueRepository";
import { createTrip, updateTrip } from "@/lib/repositories/tripRepository";
import { estimateFare } from "@/lib/fareEstimator";
import { matchDrivers } from "@/lib/dispatch";
import { recordBondFundContribution } from "@/lib/repositories/bondFundRepository";
import { getDb } from "@/lib/db";

const geoPointSchema = z.object({ lat: z.number(), lng: z.number() });
const locationSchema = z.object({ label: z.string(), address: z.string().min(3), point: geoPointSchema });

const schema = z.object({
  guestName: z.string().min(2, "Enter the guest's name"),
  guestPhone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),
  pickup: locationSchema,
  destinations: z.array(locationSchema).min(1).max(5),
  vehicle: z.object({
    make: z.string().min(1),
    model: z.string().min(1),
    plateNumber: z.string().min(4),
    transmissionType: z.enum(["manual", "automatic"]),
  }),
});

// Lists this venue's own requests — needed for /partner/dashboard's
// "view active requests" panel. Not a distinct endpoint in the original
// spec's list, which only defines the POST action.
export async function GET(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  if (auth.user.role !== "venue_partner") {
    return NextResponse.json({ error: "venue_partner_role_required" }, { status: 403 });
  }

  const db = await getDb();
  const trips = db.data.trips
    .filter((t) => t.customerId === auth.user.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json({ trips });
}

export async function POST(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  if (auth.user.role !== "venue_partner") {
    return NextResponse.json({ error: "venue_partner_role_required" }, { status: 403 });
  }

  const venue = await findVenuePartnerByOwner(auth.user.id);
  if (!venue) {
    return NextResponse.json({ error: "venue_not_found" }, { status: 404 });
  }
  // Phase 1 launch strategy gate (spec section 1 and 6): only whitelisted
  // venues can request drivers on behalf of guests.
  if (!venue.whitelisted) {
    return NextResponse.json({ error: "venue_not_whitelisted" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }
  const { guestName, guestPhone, pickup, destinations, vehicle } = parsed.data;

  const breakdown = await estimateFare(
    pickup.point,
    destinations.map((d) => d.point)
  );

  const trip = await createTrip({
    customerId: auth.user.id,
    pickup,
    destinations,
    vehicleSnapshot: vehicle,
    fareEstimate: breakdown.total,
    requestedByVenueId: venue.id,
    guestName,
    guestPhone,
  });

  const match = await matchDrivers(pickup.point, vehicle);
  let updated = trip;
  if (match) {
    updated =
      (await updateTrip(trip.id, {
        status: "matched",
        driverPrimaryId: match.primary.userId,
        driverEscortId: match.escort.userId,
        matchedAt: new Date().toISOString(),
      })) ?? trip;
    await recordBondFundContribution(trip.id, breakdown.total);
  }

  return NextResponse.json(
    { trip: updated, fareBreakdown: breakdown, dispatchStatus: match ? "matched" : "no_drivers_available" },
    { status: 201 }
  );
}
