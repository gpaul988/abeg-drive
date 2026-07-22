import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { locationPingSchema } from "@/lib/validation";
import { getTrip, addLocationPing } from "@/lib/repositories/tripRepository";
import { recordLocationPing } from "@/lib/repositories/driverRepository";

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

  const body = await req.json().catch(() => null);
  const parsed = locationPingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const reportedBy = trip.driverPrimaryId === user.id ? "driver_primary" : "driver_escort";
  await addLocationPing(tripId, {
    point: parsed.data.point,
    timestamp: new Date().toISOString(),
    reportedBy,
  });
  await recordLocationPing(user.id, parsed.data.point);

  return NextResponse.json({ acknowledged: true });
}
