import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/requireRole";
import { getDb } from "@/lib/db";
import { updateTrip } from "@/lib/repositories/tripRepository";
import { recordAuditLog } from "@/lib/repositories/auditLogRepository";

export async function GET(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const db = await getDb();
  const trips = db.data.trips.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json({ trips });
}

const disputeResolutionSchema = z.object({
  tripId: z.string().uuid(),
  fareFinal: z.number().nonnegative().optional(),
  notes: z.string().min(3),
});

// Dispute resolution: an admin can adjust the final fare (e.g. a partial
// refund after investigating a complaint) and the adjustment is logged to
// the immutable audit trail, per spec section 3.7 and 8.
export async function PATCH(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = disputeResolutionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.fareFinal !== undefined) patch.fareFinal = parsed.data.fareFinal;
  const updated = await updateTrip(parsed.data.tripId, patch);
  if (!updated) {
    return NextResponse.json({ error: "trip_not_found" }, { status: 404 });
  }

  await recordAuditLog({
    actor: auth.user,
    action: "trip_dispute_resolved",
    targetType: "trip",
    targetId: parsed.data.tripId,
    details: parsed.data.notes,
  });

  return NextResponse.json({ trip: updated });
}
