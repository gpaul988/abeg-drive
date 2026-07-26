import { getDb } from "../db";
import { DriverProfile, GeoPoint } from "../types";
import { encryptPII, decryptPII } from "../encryption";

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

/** Returns a copy with licenseNumber decrypted — never mutates the stored
 * (encrypted) record, since decrypting in place would corrupt it for the
 * next read. */
function withDecryptedLicense(profile: DriverProfile): DriverProfile {
  if (!profile.licenseNumber) return profile;
  try {
    return { ...profile, licenseNumber: decryptPII(profile.licenseNumber) };
  } catch {
    // Already-plaintext data from before encryption was introduced, or a
    // malformed payload — fail safe by returning as-is rather than crashing.
    return profile;
  }
}

export async function getDriverProfile(userId: string): Promise<DriverProfile | undefined> {
  const db = await getDb();
  const profile = db.data.driverProfiles.find((d) => d.userId === userId);
  return profile ? withDecryptedLicense(profile) : undefined;
}

export async function updateDriverProfile(
  userId: string,
  patch: Partial<DriverProfile>
): Promise<DriverProfile | undefined> {
  const db = await getDb();
  const profile = db.data.driverProfiles.find((d) => d.userId === userId);
  if (!profile) return undefined;

  const encryptedPatch = { ...patch };
  if (encryptedPatch.licenseNumber) encryptedPatch.licenseNumber = encryptPII(encryptedPatch.licenseNumber);

  Object.assign(profile, encryptedPatch);
  await db.write();
  return withDecryptedLicense(profile);
}

export async function listDriverProfiles(): Promise<DriverProfile[]> {
  const db = await getDb();
  return db.data.driverProfiles.map(withDecryptedLicense);
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
