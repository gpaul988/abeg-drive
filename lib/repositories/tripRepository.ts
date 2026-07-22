import { randomUUID, randomBytes } from "crypto";
import { getDb } from "../db";
import { Trip, TripLocation, VehicleSnapshot, LocationPing, TripStatus } from "../types";

export async function createTrip(input: {
  customerId: string;
  pickup: TripLocation;
  destinations: TripLocation[];
  vehicleSnapshot: VehicleSnapshot;
  scheduledTime?: string;
  fareEstimate: number;
}): Promise<Trip> {
  const db = await getDb();
  const trip: Trip = {
    id: randomUUID(),
    customerId: input.customerId,
    pickup: input.pickup,
    destinations: input.destinations,
    scheduledTime: input.scheduledTime,
    vehicleSnapshot: input.vehicleSnapshot,
    status: "requested",
    fareEstimate: input.fareEstimate,
    paymentStatus: "pending",
    livelocationPings: [],
    createdAt: new Date().toISOString(),
  };
  db.data.trips.push(trip);
  await db.write();
  return trip;
}

export async function getTrip(id: string): Promise<Trip | undefined> {
  const db = await getDb();
  return db.data.trips.find((t) => t.id === id);
}

export async function getTripByShareToken(token: string): Promise<Trip | undefined> {
  const db = await getDb();
  return db.data.trips.find((t) => t.shareTripLinkToken === token);
}

export async function updateTrip(id: string, patch: Partial<Trip>): Promise<Trip | undefined> {
  const db = await getDb();
  const trip = db.data.trips.find((t) => t.id === id);
  if (!trip) return undefined;
  Object.assign(trip, patch);
  await db.write();
  return trip;
}

export async function listTripsForCustomer(customerId: string): Promise<Trip[]> {
  const db = await getDb();
  return db.data.trips
    .filter((t) => t.customerId === customerId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listTripsForDriver(driverId: string): Promise<Trip[]> {
  const db = await getDb();
  return db.data.trips
    .filter((t) => t.driverPrimaryId === driverId || t.driverEscortId === driverId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listActiveTrips(): Promise<Trip[]> {
  const db = await getDb();
  const activeStatuses: TripStatus[] = ["requested", "matched", "en_route", "in_progress", "incident"];
  return db.data.trips.filter((t) => activeStatuses.includes(t.status));
}

export async function addLocationPing(tripId: string, ping: LocationPing): Promise<void> {
  const db = await getDb();
  const trip = db.data.trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.livelocationPings.push(ping);
  // Retain a bounded trail in the dev store; production retains the full
  // trail for the compliance-mandated 12-month window in a dedicated table.
  if (trip.livelocationPings.length > 500) {
    trip.livelocationPings = trip.livelocationPings.slice(-500);
  }
  await db.write();
}

export function generateShareToken(): string {
  return randomBytes(16).toString("hex");
}
