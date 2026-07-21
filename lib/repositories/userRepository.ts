import { randomUUID } from "crypto";
import { getDb } from "../db";
import { BaseUser, CustomerProfile, OtpRecord, RefreshTokenRecord, UserRole } from "../types";

export async function findUserByPhone(phone: string): Promise<BaseUser | undefined> {
  const db = await getDb();
  return db.data.users.find((u) => u.phone === phone);
}

export async function findUserByEmail(email: string): Promise<BaseUser | undefined> {
  const db = await getDb();
  return db.data.users.find((u) => u.email === email);
}

export async function findUserById(id: string): Promise<BaseUser | undefined> {
  const db = await getDb();
  return db.data.users.find((u) => u.id === id);
}

export async function createUser(input: {
  phone: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}): Promise<BaseUser> {
  const db = await getDb();
  const user: BaseUser = {
    id: randomUUID(),
    phone: input.phone,
    email: input.email,
    passwordHash: input.passwordHash,
    role: input.role,
    createdAt: new Date().toISOString(),
    verificationStatus: "pending",
  };
  db.data.users.push(user);

  if (input.role === "customer") {
    const profile: CustomerProfile = {
      userId: user.id,
      emergencyContacts: [],
      savedVehicles: [],
      trustScore: 100,
    };
    db.data.customerProfiles.push(profile);
  }

  await db.write();
  return user;
}

export async function updateUser(id: string, patch: Partial<BaseUser>): Promise<BaseUser | undefined> {
  const db = await getDb();
  const user = db.data.users.find((u) => u.id === id);
  if (!user) return undefined;
  Object.assign(user, patch);
  await db.write();
  return user;
}

export async function getCustomerProfile(userId: string): Promise<CustomerProfile | undefined> {
  const db = await getDb();
  return db.data.customerProfiles.find((p) => p.userId === userId);
}

export async function updateCustomerProfile(
  userId: string,
  patch: Partial<CustomerProfile>
): Promise<CustomerProfile | undefined> {
  const db = await getDb();
  const profile = db.data.customerProfiles.find((p) => p.userId === userId);
  if (!profile) return undefined;
  Object.assign(profile, patch);
  await db.write();
  return profile;
}

// --- OTP ---

export async function createOtp(phone: string, code: string, ttlMs: number): Promise<OtpRecord> {
  const db = await getDb();
  // invalidate any prior unconsumed OTPs for this phone
  db.data.otps.forEach((o) => {
    if (o.phone === phone && !o.consumedAt) o.consumedAt = new Date().toISOString();
  });
  const record: OtpRecord = {
    phone,
    code,
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
  };
  db.data.otps.push(record);
  await db.write();
  return record;
}

export async function consumeOtp(phone: string, code: string): Promise<boolean> {
  const db = await getDb();
  const record = db.data.otps
    .filter((o) => o.phone === phone && o.code === code && !o.consumedAt)
    .sort((a, b) => (a.expiresAt < b.expiresAt ? 1 : -1))[0];

  if (!record) return false;
  if (new Date(record.expiresAt).getTime() < Date.now()) return false;

  record.consumedAt = new Date().toISOString();
  await db.write();
  return true;
}

// --- Refresh tokens ---

export async function storeRefreshToken(token: string, userId: string, ttlMs: number): Promise<void> {
  const db = await getDb();
  const record: RefreshTokenRecord = {
    token,
    userId,
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
  };
  db.data.refreshTokens.push(record);
  await db.write();
}

export async function isRefreshTokenValid(token: string): Promise<RefreshTokenRecord | undefined> {
  const db = await getDb();
  const record = db.data.refreshTokens.find((r) => r.token === token);
  if (!record) return undefined;
  if (record.revokedAt) return undefined;
  if (new Date(record.expiresAt).getTime() < Date.now()) return undefined;
  return record;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const db = await getDb();
  const record = db.data.refreshTokens.find((r) => r.token === token);
  if (record) {
    record.revokedAt = new Date().toISOString();
    await db.write();
  }
}
