import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { loadTripForUser } from "@/lib/tripAccess";
import { panicSchema } from "@/lib/validation";
import { updateTrip } from "@/lib/repositories/tripRepository";
import { createIncident } from "@/lib/repositories/incidentRepository";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const result = await loadTripForUser(id, auth.user);
  if ("error" in result) return result.error;

  const body = await req.json().catch(() => null);
  const parsed = panicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  // Per spec section 8: panic button must have <5 second response SLA to
  // trigger ops/security escalation. This handler is synchronous and
  // completes in milliseconds against the dev store; in production this
  // would also push a real-time event (WebSocket/Pusher) to the Security
  // Agent dashboard and page an on-call responder, in parallel with the DB
  // write, so the human-perceived alert time stays under the SLA even if
  // the write itself is slower.
  const incident = await createIncident({
    tripId: id,
    triggeredBy: parsed.data.triggeredBy,
    type: "panic",
  });
  await updateTrip(id, { status: "incident" });

  return NextResponse.json(
    {
      incidentId: incident.id,
      escalated: incident.escalatedToSecurityPartner,
      message: "Alert sent. Security response is being dispatched.",
    },
    { status: 201 }
  );
}
