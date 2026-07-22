import { NextResponse } from "next/server";
import { getTripByShareToken } from "@/lib/repositories/tripRepository";
import { getDriverProfile } from "@/lib/repositories/driverRepository";
import { findUserById } from "@/lib/repositories/userRepository";
import { distanceKm, PORT_HARCOURT_CENTER } from "@/lib/geo";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const trip = await getTripByShareToken(token);
  if (!trip) {
    return NextResponse.json({ error: "invalid_or_expired_link" }, { status: 404 });
  }

  let driverInfo = null;
  if (trip.driverPrimaryId) {
    const [driverUser, driverProfile] = await Promise.all([
      findUserById(trip.driverPrimaryId),
      getDriverProfile(trip.driverPrimaryId),
    ]);
    const currentLocation = driverProfile?.currentLocation ?? PORT_HARCOURT_CENTER;
    const distance = distanceKm(currentLocation, trip.pickup.point);
    const etaMinutes = Math.max(1, Math.round((distance / 30) * 60));
    // Deliberately minimal — a public link never exposes the driver's full
    // name/phone or the customer's identity, only first-name-style label.
    driverInfo = {
      firstName: driverUser?.email?.split("@")[0]?.split(".")[0] ?? "Driver",
      currentLocation,
      etaMinutes,
    };
  }

  return NextResponse.json({
    status: trip.status,
    pickup: trip.pickup,
    destinations: trip.destinations,
    driver: driverInfo,
  });
}
