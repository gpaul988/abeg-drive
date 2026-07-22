import { getDb } from "../db";
import { DriverProfile, GeoPoint } from "../types";

const DEFAULT_PROBATION_TRIPS_REQUIRED = 10;

export async function createDriverProfile(userId: string): Promise<DriverProfile> {
  const db = await getDb();
  const profile: DriverProfile = {
    userId,
    applicationStatus: "submitted",
    addressVerified: false,
    backgroundCheckStatus: "not_started",
    vehicleCompetency: [],
    probationStatus: "in_probation",
    tripsCompleted: 0,
    probationTripsRequired: DEFAULT_PROBATION_TRIPS_REQUIRED,
    ratingAvg: 0,
    ratingCount: 0,
    availability: "offline",
    trainingModulesCompleted: [],
    createdAt: new Date().toISOString(),
  };
  db.data.driverProfiles.push(profile);
  await db.write();
  return profile;
}

export async function getDriverProfile(userId: string): Promise<DriverProfile | undefined> {
  const db = await getDb();
  return db.data.driverProfiles.find((d) => d.userId === userId);
}

export async function updateDriverProfile(
  userId: string,
  patch: Partial<DriverProfile>
): Promise<DriverProfile | undefined> {
  const db = await getDb();
  const profile = db.data.driverProfiles.find((d) => d.userId === userId);
  if (!profile) return undefined;
  Object.assign(profile, patch);
  await db.write();
  return profile;
}

export async function listDriverProfiles(): Promise<DriverProfile[]> {
  const db = await getDb();
  return db.data.driverProfiles;
}

export async function findAvailableDrivers(
  excludeUserId?: string
): Promise<DriverProfile[]> {
  const db = await getDb();
  return db.data.driverProfiles.filter(
    (d) =>
      d.availability === "online" &&
      d.applicationStatus === "approved" &&
      d.userId !== excludeUserId
  );
}

export async function recordLocationPing(userId: string, point: GeoPoint): Promise<void> {
  const db = await getDb();
  const profile = db.data.driverProfiles.find((d) => d.userId === userId);
  if (!profile) return;
  profile.currentLocation = point;
  profile.lastLocationPingAt = new Date().toISOString();
  await db.write();
}
