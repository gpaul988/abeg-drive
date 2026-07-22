import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { loadTripForUser } from "@/lib/tripAccess";
import { rateTripSchema } from "@/lib/validation";
import { updateTrip } from "@/lib/repositories/tripRepository";
import { getDriverProfile, updateDriverProfile } from "@/lib/repositories/driverRepository";
import { updateCustomerProfile, getCustomerProfile } from "@/lib/repositories/userRepository";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const result = await loadTripForUser(id, auth.user);
  if ("error" in result) return result.error;
  const { trip } = result;

  if (trip.status !== "completed") {
    return NextResponse.json({ error: "trip_not_completed" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = rateTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }
  const { rating, comment, direction } = parsed.data;

  if (direction === "customer_to_driver") {
    await updateTrip(id, { ratingCustomerToDriver: rating, ratingComment: comment });
    if (trip.driverPrimaryId) {
      const driver = await getDriverProfile(trip.driverPrimaryId);
      if (driver) {
        const newCount = driver.ratingCount + 1;
        const newAvg = Math.round(((driver.ratingAvg * driver.ratingCount + rating) / newCount) * 100) / 100;
        await updateDriverProfile(trip.driverPrimaryId, { ratingAvg: newAvg, ratingCount: newCount });
      }
    }
  } else {
    await updateTrip(id, { ratingDriverToCustomer: rating });
    const profile = await getCustomerProfile(trip.customerId);
    if (profile) {
      // No-show/poor behavior lowers trust score; good ratings restore it,
      // capped at 100.
      const delta = (rating - 3) * 2;
      await updateCustomerProfile(trip.customerId, {
        trustScore: Math.max(0, Math.min(100, profile.trustScore + delta)),
      });
    }
  }

  return NextResponse.json({ success: true });
}
