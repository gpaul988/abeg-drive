import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { updateTrip } from "@/lib/repositories/tripRepository";
import { getDb } from "@/lib/db";

// Production Paystack webhook verification: Paystack signs the raw request
// body with your secret key (HMAC-SHA512) and sends it as the
// x-paystack-signature header. This dev implementation validates that
// signature if PAYSTACK_SECRET_KEY is set, and otherwise accepts requests
// unsigned — acceptable only because no real key exists in this sandbox.
// NEVER disable signature verification in production; an unverified
// webhook lets anyone mark arbitrary trips as paid.
export async function POST(req: Request) {
  const rawBody = await req.text();
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (secretKey) {
    const signature = req.headers.get("x-paystack-signature");
    const expected = createHmac("sha512", secretKey).update(rawBody).digest("hex");
    if (!signature || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  }

  const event = JSON.parse(rawBody || "{}");
  const reference: string | undefined = event?.data?.reference;
  const status: string | undefined = event?.data?.status;

  if (!reference) {
    return NextResponse.json({ error: "missing_reference" }, { status: 400 });
  }

  const db = await getDb();
  const trip = db.data.trips.find((t) => t.paymentReference === reference);
  if (!trip) {
    // Acknowledge anyway — Paystack retries on non-2xx, and a reference we
    // don't recognize (e.g. a test event) isn't actionable.
    return NextResponse.json({ received: true });
  }

  if (event?.event === "charge.success" || status === "success") {
    await updateTrip(trip.id, { paymentStatus: "captured" });
  } else if (event?.event === "charge.failed" || status === "failed") {
    await updateTrip(trip.id, { paymentStatus: "failed" });
  }

  return NextResponse.json({ received: true });
}
