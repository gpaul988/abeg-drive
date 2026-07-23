import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/requireAuth";
import { loadTripForUser } from "@/lib/tripAccess";
import { getCustomerProfile } from "@/lib/repositories/userRepository";
import { updateTrip } from "@/lib/repositories/tripRepository";
import { randomUUID } from "crypto";

const schema = z.object({ tripId: z.string().uuid() });

// MVP: the trip flow already marks paymentStatus "captured" on completion
// (see drivers/me/trips/:tripId/complete) using the saved card token
// captured at signup. This standalone charge endpoint exists for the case
// where a charge needs to be triggered independently of trip completion
// (e.g. re-attempting a failed capture) — a real implementation calls
// Paystack's /transaction/charge_authorization with the saved
// authorization code from lib/providers/payments.ts.
export async function POST(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }

  const result = await loadTripForUser(parsed.data.tripId, auth.user);
  if ("error" in result) return result.error;
  const { trip } = result;

  const profile = await getCustomerProfile(trip.customerId);
  if (!profile?.paymentMethodToken) {
    return NextResponse.json({ error: "no_payment_method_on_file" }, { status: 409 });
  }

  const reference = `chg_dev_${randomUUID().slice(0, 12)}`;
  const updated = await updateTrip(trip.id, {
    paymentStatus: "captured",
    paymentReference: reference,
    fareFinal: trip.fareFinal ?? trip.fareEstimate,
  });

  return NextResponse.json({ trip: updated, reference });
}
