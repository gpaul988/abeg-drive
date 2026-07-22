import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { loadTripForUser } from "@/lib/tripAccess";
import { getDriverProfile } from "@/lib/repositories/driverRepository";
import { findUserById } from "@/lib/repositories/userRepository";
import { distanceKm, PORT_HARCOURT_CENTER } from "@/lib/geo";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const result = await loadTripForUser(id, auth.user);
  if ("error" in result) return result.error;
  const { trip } = result;

  let driverInfo = null;
  if (trip.driverPrimaryId) {
    const [driverUser, driverProfile] = await Promise.all([
      findUserById(trip.driverPrimaryId),
      getDriverProfile(trip.driverPrimaryId),
    ]);
    const currentLocation = driverProfile?.currentLocation ?? PORT_HARCOURT_CENTER;
    const distance = distanceKm(currentLocation, trip.pickup.point);
    // Rough ETA assumption: 30 km/h average city speed. Production computes
    // this from Google Directions API traffic-aware duration.
    const etaMinutes = Math.max(1, Math.round((distance / 30) * 60));

    driverInfo = {
      name: driverUser?.email?.split("@")[0] ?? "Driver",
      ratingAvg: driverProfile?.ratingAvg ?? 0,
      currentLocation,
      etaMinutes,
    };
  }

  return NextResponse.json({
    status: trip.status,
    pickup: trip.pickup,
    destinations: trip.destinations,
    driver: driverInfo,
    recentPings: trip.livelocationPings.slice(-20),
    shareTripLinkToken: trip.shareTripLinkToken,
  });
}
