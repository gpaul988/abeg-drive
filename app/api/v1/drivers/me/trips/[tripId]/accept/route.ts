import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { getTrip, updateTrip } from "@/lib/repositories/tripRepository";

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
  if (trip.status !== "matched") {
    return NextResponse.json({ error: "trip_not_awaiting_acceptance" }, { status: 409 });
  }

  const updated = await updateTrip(tripId, { status: "en_route" });
  return NextResponse.json({ trip: updated });
}
