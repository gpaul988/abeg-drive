import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { createTripSchema } from "@/lib/validation";
import { createTrip, updateTrip, listTripsForCustomer, listTripsForDriver } from "@/lib/repositories/tripRepository";
import { estimateFare } from "@/lib/fareEstimator";
import { matchDrivers } from "@/lib/dispatch";
import { getCustomerProfile } from "@/lib/repositories/userRepository";
import { recordBondFundContribution } from "@/lib/repositories/bondFundRepository";

// Not a distinct endpoint in the original spec's list (which only defines
// GET /trips/:id), but required to power /trip-history without scanning
// every trip client-side.
export async function GET(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const trips =
    user.role === "driver" ? await listTripsForDriver(user.id) : await listTripsForCustomer(user.id);

  return NextResponse.json({ trips });
}

export async function POST(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user } = auth;

  if (user.role !== "customer") {
    return NextResponse.json({ error: "customer_role_required" }, { status: 403 });
  }
  if (!user.otpVerifiedAt || !user.identityVerifiedAt) {
    return NextResponse.json({ error: "identity_verification_required" }, { status: 409 });
  }
  const profile = await getCustomerProfile(user.id);
  if (!profile?.paymentMethodToken) {
    return NextResponse.json({ error: "payment_method_required" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }
  const { pickup, destinations, vehicle, scheduledTime } = parsed.data;

  const breakdown = await estimateFare(
    pickup.point,
    destinations.map((d) => d.point)
  );

  const trip = await createTrip({
    customerId: user.id,
    pickup,
    destinations,
    vehicleSnapshot: vehicle,
    scheduledTime,
    fareEstimate: breakdown.total,
  });

  // Attempt immediate dispatch for "now" bookings; scheduled bookings are
  // matched closer to departure time by a background job in production
  // (not simulated here — MVP dev behavior matches immediately either way
  // so the flow is fully exercisable end-to-end).
  const match = await matchDrivers(pickup.point, vehicle);
  let updated = trip;
  if (match) {
    updated = (await updateTrip(trip.id, {
      status: "matched",
      driverPrimaryId: match.primary.userId,
      driverEscortId: match.escort.userId,
      matchedAt: new Date().toISOString(),
    })) ?? trip;
    await recordBondFundContribution(trip.id, breakdown.total);
  }

  return NextResponse.json(
    {
      trip: updated,
      fareBreakdown: breakdown,
      dispatchStatus: match ? "matched" : "no_drivers_available",
    },
    { status: 201 }
  );
}
