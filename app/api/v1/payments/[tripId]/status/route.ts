import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { loadTripForUser } from "@/lib/tripAccess";

export async function GET(req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const { tripId } = await params;
  const result = await loadTripForUser(tripId, auth.user);
  if ("error" in result) return result.error;

  return NextResponse.json({
    paymentStatus: result.trip.paymentStatus,
    paymentReference: result.trip.paymentReference,
    fareFinal: result.trip.fareFinal ?? result.trip.fareEstimate,
  });
}
