import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

// Encrypts PII (NIN, BVN, license numbers) before it's written to the data
// store, per spec section 8: "All PII... encrypted at rest and in transit;
// access logged." This was previously stored in plaintext in the dev JSON
// file — a real gap, now fixed at the repository layer so callers never
// have to remember to encrypt/decrypt manually.
//
// Production: ENCRYPTION_KEY must be a real secret from a KMS or secrets
// manager, never committed. The dev fallback below lets the app run out of
// the box but is NOT safe for real user data — it's derived from a fixed
// string, so anyone with the source can decrypt anything encrypted with
// the default key.
const RAW_KEY = process.env.ENCRYPTION_KEY || "dev-only-insecure-encryption-key-change-me";
const KEY = scryptSync(RAW_KEY, "abegdrive-static-salt", 32);
const ALGO = "aes-256-gcm";

export function encryptPII(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:ciphertext, all hex — self-contained so decryption
  // doesn't need anything but the key.
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptPII(ciphertext: string): string {
  const [ivHex, authTagHex, dataHex] = ciphertext.split(":");
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error("Malformed encrypted payload");
  }
  const decipher = createDecipheriv(ALGO, KEY, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}

/** Last 4 digits only — for displaying "on file" status to admins without
 * ever transmitting the full number over the API. */
export function maskPII(plaintext: string): string {
  if (plaintext.length <= 4) return "••••";
  return `••••••${plaintext.slice(-4)}`;
}
