import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { loadTripForUser } from "@/lib/tripAccess";
import { updateTrip, generateShareToken } from "@/lib/repositories/tripRepository";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const result = await loadTripForUser(id, auth.user);
  if ("error" in result) return result.error;

  const token = result.trip.shareTripLinkToken ?? generateShareToken();
  await updateTrip(id, { shareTripLinkToken: token });

  return NextResponse.json({ shareTripLinkToken: token, url: `/track/${token}` });
}
