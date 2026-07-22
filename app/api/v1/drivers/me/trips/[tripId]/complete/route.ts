import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { getTrip, updateTrip } from "@/lib/repositories/tripRepository";
import { getDriverProfile, updateDriverProfile } from "@/lib/repositories/driverRepository";

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
  if (trip.driverPrimaryId !== user.id) {
    return NextResponse.json({ error: "only_primary_driver_can_complete_trip" }, { status: 403 });
  }
  if (trip.status !== "in_progress") {
    return NextResponse.json({ error: "trip_not_in_progress" }, { status: 409 });
  }

  const updated = await updateTrip(tripId, {
    status: "completed",
    completedAt: new Date().toISOString(),
    fareFinal: trip.fareEstimate,
    paymentStatus: "captured",
  });

  // Release both drivers back to the available pool and progress probation.
  for (const driverId of [trip.driverPrimaryId, trip.driverEscortId]) {
    if (!driverId) continue;
    await updateDriverProfile(driverId, { availability: "online" });
    const profile = await getDriverProfile(driverId);
    if (profile) {
      const tripsCompleted = profile.tripsCompleted + 1;
      const graduated = tripsCompleted >= profile.probationTripsRequired;
      await updateDriverProfile(driverId, {
        tripsCompleted,
        probationStatus: graduated ? "graduated" : profile.probationStatus,
      });
    }
  }

  return NextResponse.json({ trip: updated });
}
