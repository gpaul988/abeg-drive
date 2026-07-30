import { randomUUID, randomBytes } from "crypto";
import { getDb } from "../db";
import { BaseUser, CustomerProfile, OtpRecord, RefreshTokenRecord, UserRole } from "../types";
import { encryptPII, decryptPII } from "../encryption";

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

export async function listUsersByRole(role: UserRole): Promise<BaseUser[]> {
  const db = await getDb();
  return db.data.users.filter((u) => u.role === role);
}

export async function createUser(input: {
  phone: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  referredByCode?: string;
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
    failedLoginAttempts: 0,
  };
  db.data.users.push(user);

  if (input.role === "customer") {
    const referralCode = generateUniqueReferralCode(db.data.customerProfiles);
    const profile: CustomerProfile = {
      userId: user.id,
      emergencyContacts: [],
      savedVehicles: [],
      trustScore: 100,
      referralCode,
      referralCount: 0,
    };

    if (input.referredByCode) {
      const referrer = db.data.customerProfiles.find(
        (p) => p.referralCode.toLowerCase() === input.referredByCode!.toLowerCase()
      );
      if (referrer) {
        profile.referredByCode = referrer.referralCode;
        referrer.referralCount += 1;
      }
    }

    db.data.customerProfiles.push(profile);
  }

  await db.write();
  return user;
}

function generateUniqueReferralCode(existingProfiles: CustomerProfile[]): string {
  const existing = new Set(existingProfiles.map((p) => p.referralCode));
  let code: string;
  do {
    code = `ABEG-${randomBytes(3).toString("hex").toUpperCase()}`;
  } while (existing.has(code));
  return code;
}

export async function updateUser(id: string, patch: Partial<BaseUser>): Promise<BaseUser | undefined> {
  const db = await getDb();
  const user = db.data.users.find((u) => u.id === id);
  if (!user) return undefined;

  // PII encrypted at rest, per spec section 8. Encryption happens here,
  // at the single write path, so every call site (nin-verify, drivers/
  // documents, etc.) stores plaintext values as normal and never has to
  // remember to encrypt manually.
  const encryptedPatch = { ...patch };
  if (encryptedPatch.ninNumber) encryptedPatch.ninNumber = encryptPII(encryptedPatch.ninNumber);
  if (encryptedPatch.bvnNumber) encryptedPatch.bvnNumber = encryptPII(encryptedPatch.bvnNumber);

  Object.assign(user, encryptedPatch);
  await db.write();
  return user;
}

/** Decrypts a user's NIN, if present — only for the rare case business
 * logic needs the real value (e.g. resubmitting to an external KYC
 * provider). Never call this to satisfy an API response. */
export function decryptUserNin(user: BaseUser): string | undefined {
  return user.ninNumber ? decryptPII(user.ninNumber) : undefined;
}

export function decryptUserBvn(user: BaseUser): string | undefined {
  return user.bvnNumber ? decryptPII(user.bvnNumber) : undefined;
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

export async function addVehicleToProfile(
  userId: string,
  vehicle: CustomerProfile["savedVehicles"][number]
): Promise<CustomerProfile | undefined> {
  const db = await getDb();
  const profile = db.data.customerProfiles.find((p) => p.userId === userId);
  if (!profile) return undefined;
  profile.savedVehicles.push(vehicle);
  await db.write();
  return profile;
}

export async function addEmergencyContactToProfile(
  userId: string,
  contact: CustomerProfile["emergencyContacts"][number]
): Promise<CustomerProfile | undefined> {
  const db = await getDb();
  const profile = db.data.customerProfiles.find((p) => p.userId === userId);
  if (!profile) return undefined;
  profile.emergencyContacts.push(contact);
  await db.write();
  return profile;
}

// --- OTP ---

export async function createOtp(identifier: string, code: string, ttlMs: number): Promise<OtpRecord> {
  const db = await getDb();
  // invalidate any prior unconsumed OTPs for this identifier
  db.data.otps.forEach((o) => {
    if (o.identifier === identifier && !o.consumedAt) o.consumedAt = new Date().toISOString();
  });
  const record: OtpRecord = {
    identifier,
    code,
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
  };
  db.data.otps.push(record);
  await db.write();
  return record;
}

export async function consumeOtp(identifier: string, code: string): Promise<boolean> {
  const db = await getDb();
  const record = db.data.otps
    .filter((o) => o.identifier === identifier && o.code === code && !o.consumedAt)
    .sort((a, b) => (a.expiresAt < b.expiresAt ? 1 : -1))[0];

  if (!record) return false;
  if (new Date(record.expiresAt).getTime() < Date.now()) return false;

  record.consumedAt = new Date().toISOString();
  await db.write();
  return true;
}

// --- Refresh tokens ---

export async function storeRefreshToken(
  token: string,
  userId: string,
  ttlMs: number,
  userAgent?: string
): Promise<void> {
  const db = await getDb();
  const record: RefreshTokenRecord = {
    id: randomUUID(),
    token,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    userAgent,
  };
  db.data.refreshTokens.push(record);
  await db.write();
}

/** Lists a user's active (non-revoked, non-expired) sessions — for the
 * "active sessions" account security page. Never includes the raw token
 * value; the record's own id is the safe identifier for revocation. */
export async function listActiveSessionsForUser(userId: string): Promise<RefreshTokenRecord[]> {
  const db = await getDb();
  const now = Date.now();
  return db.data.refreshTokens
    .filter((r) => r.userId === userId && !r.revokedAt && new Date(r.expiresAt).getTime() > now)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function revokeSessionById(userId: string, sessionId: string): Promise<boolean> {
  const db = await getDb();
  const record = db.data.refreshTokens.find((r) => r.id === sessionId && r.userId === userId);
  if (!record || record.revokedAt) return false;
  record.revokedAt = new Date().toISOString();
  await db.write();
  return true;
}

/** Raw lookup, regardless of revoked/expired status — needed to distinguish
 * "never existed" from "existed but was already used" (reuse detection). */
export async function findRefreshTokenRecord(token: string): Promise<RefreshTokenRecord | undefined> {
  const db = await getDb();
  return db.data.refreshTokens.find((r) => r.token === token);
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

/** Revokes every active refresh token for a user — the response to
 * detected token reuse (a strong signal of theft), forcing a fresh login
 * on every device rather than leaving a possibly-compromised session
 * family alive. */
export async function revokeAllRefreshTokensForUser(userId: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  for (const record of db.data.refreshTokens) {
    if (record.userId === userId && !record.revokedAt) {
      record.revokedAt = now;
    }
  }
  await db.write();
}
