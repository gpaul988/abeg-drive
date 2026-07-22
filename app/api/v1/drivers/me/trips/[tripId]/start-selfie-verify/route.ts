import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/requireAuth";
import { getTrip, updateTrip } from "@/lib/repositories/tripRepository";
import { verifySelfieLiveness } from "@/lib/providers/kyc";

const schema = z.object({ selfieImageBase64: z.string().min(10) });

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
    return NextResponse.json({ error: "only_primary_driver_can_start_trip" }, { status: 403 });
  }
  if (trip.status !== "en_route") {
    return NextResponse.json({ error: "trip_not_ready_to_start" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const result = await verifySelfieLiveness(user.id, parsed.data.selfieImageBase64);
  if (!result.match) {
    return NextResponse.json({ match: false, error: "selfie_did_not_match_driver_profile" }, { status: 422 });
  }

  const updated = await updateTrip(tripId, {
    status: "in_progress",
    startSelfieMatchResult: true,
    startedAt: new Date().toISOString(),
  });

  return NextResponse.json({ match: true, trip: updated });
}
