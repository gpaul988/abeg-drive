import { NextResponse } from "next/server";
import { Trip, BaseUser } from "./types";
import { getTrip } from "./repositories/tripRepository";

// Confirms the requesting user is a party to this trip (customer, primary
// driver, escort driver) or holds an internal role that can see all trips.
export async function loadTripForUser(
  tripId: string,
  user: BaseUser
): Promise<{ trip: Trip } | { error: NextResponse }> {
  const trip = await getTrip(tripId);
  if (!trip) {
    return { error: NextResponse.json({ error: "trip_not_found" }, { status: 404 }) };
  }

  const internalRoles = ["platform_admin", "super_admin", "security_agent"];
  const isParty =
    trip.customerId === user.id ||
    trip.driverPrimaryId === user.id ||
    trip.driverEscortId === user.id;

  if (!isParty && !internalRoles.includes(user.role)) {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }

  return { trip };
}
