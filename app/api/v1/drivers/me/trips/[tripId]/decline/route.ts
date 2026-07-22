import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { getTrip, updateTrip } from "@/lib/repositories/tripRepository";
import { updateDriverProfile } from "@/lib/repositories/driverRepository";
import { matchDrivers } from "@/lib/dispatch";

export async function POST(req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user } = auth;

  if (user.role !== "driver") {
    return NextResponse.json({ error: "driver_role_required" }, { status: 403 });
  }

  const { tripId } = await params;
  const trip = await getTrip(tripId);
  if (!trip) {
    return NextResponse.json({ error: "trip_not_found" }, { status: 404 });
  }
  if (trip.driverPrimaryId !== user.id && trip.driverEscortId !== user.id) {
    return NextResponse.json({ error: "not_assigned_to_this_trip" }, { status: 403 });
  }

  // Free this driver, then attempt to re-match immediately so the customer
  // isn't left waiting indefinitely.
  await updateDriverProfile(user.id, { availability: "online" });

  const otherDriverId = trip.driverPrimaryId === user.id ? trip.driverEscortId : trip.driverPrimaryId;
  if (otherDriverId) await updateDriverProfile(otherDriverId, { availability: "online" });

  const rematch = await matchDrivers(trip.pickup.point, trip.vehicleSnapshot);
  const updated = rematch
    ? await updateTrip(tripId, {
        status: "matched",
        driverPrimaryId: rematch.primary.userId,
        driverEscortId: rematch.escort.userId,
        matchedAt: new Date().toISOString(),
      })
    : await updateTrip(tripId, {
        status: "requested",
        driverPrimaryId: undefined,
        driverEscortId: undefined,
      });

  return NextResponse.json({ trip: updated, rematched: Boolean(rematch) });
}
