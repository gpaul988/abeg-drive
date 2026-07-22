import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { loadTripForUser } from "@/lib/tripAccess";
import { cancelTripSchema } from "@/lib/validation";
import { updateTrip } from "@/lib/repositories/tripRepository";
import { updateDriverProfile } from "@/lib/repositories/driverRepository";

const TERMINAL_STATUSES = ["completed", "cancelled"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const result = await loadTripForUser(id, auth.user);
  if ("error" in result) return result.error;
  const { trip } = result;

  if (TERMINAL_STATUSES.includes(trip.status)) {
    return NextResponse.json({ error: "trip_already_finalized" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = cancelTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateTrip(id, {
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
    cancellationReason: parsed.data.reason,
  });

  // Free up matched drivers so they re-enter the available pool.
  if (trip.driverPrimaryId) await updateDriverProfile(trip.driverPrimaryId, { availability: "online" });
  if (trip.driverEscortId) await updateDriverProfile(trip.driverEscortId, { availability: "online" });

  return NextResponse.json({ trip: updated });
}
