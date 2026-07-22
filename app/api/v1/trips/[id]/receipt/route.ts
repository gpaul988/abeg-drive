import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { loadTripForUser } from "@/lib/tripAccess";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const result = await loadTripForUser(id, auth.user);
  if ("error" in result) return result.error;
  const { trip } = result;

  if (trip.status !== "completed") {
    return NextResponse.json({ error: "trip_not_completed" }, { status: 409 });
  }

  return NextResponse.json({
    tripId: trip.id,
    pickup: trip.pickup,
    destinations: trip.destinations,
    vehicle: trip.vehicleSnapshot,
    fareFinal: trip.fareFinal ?? trip.fareEstimate,
    paymentStatus: trip.paymentStatus,
    completedAt: trip.completedAt,
    createdAt: trip.createdAt,
  });
}
