// Provisions internal admin-tier accounts. There is no public signup form
// for platform_admin / security_agent / super_admin — per the principle
// that internal roles are provisioned by trusted staff, not self-service —
// so this script is the equivalent of an ops/infra onboarding step.
//
// Usage: npx tsx scripts/seed-admin.ts
//
// Prints the TOTP secret + otpauth:// URI for each account so you can add
// it to an authenticator app (Google Authenticator, Authy, 1Password, etc.)
// before logging in at /admin/login.

import { generateSecret, generate, generateURI } from "otplib";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";

interface Account {
  role: "super_admin" | "platform_admin" | "security_agent";
  email: string;
  phone: string;
  password: string;
}

const ACCOUNTS: Account[] = [
  { role: "super_admin", email: "superadmin@abegdrive.ng", phone: "08010000001", password: "ChangeMe123!" },
  { role: "platform_admin", email: "opsadmin@abegdrive.ng", phone: "08010000002", password: "ChangeMe123!" },
  { role: "security_agent", email: "security1@abegdrive.ng", phone: "08010000003", password: "ChangeMe123!" },
];

async function main() {
  const file = path.join(process.cwd(), "data", "db.json");
  const db = new Low<any>(new JSONFile(file), null);
  await db.read();
  if (!db.data) {
    console.error("data/db.json not found or empty — start the app once first so it initializes the store.");
    process.exit(1);
  }

  for (const account of ACCOUNTS) {
    const existing = db.data.users.find((u: any) => u.email === account.email);
    if (existing) {
      console.log(`Skipping ${account.email} — already exists.`);
      continue;
    }

    const passwordHash = await bcrypt.hash(account.password, 10);
    const totpSecret = generateSecret();
    const otpauthUrl = generateURI({ secret: totpSecret, issuer: "AbegDrive", label: account.email });
    const currentCode = await generate({ secret: totpSecret });

    db.data.users.push({
      id: randomUUID(),
      phone: account.phone,
      email: account.email,
      passwordHash,
      role: account.role,
      createdAt: new Date().toISOString(),
      verificationStatus: "verified",
      totpSecret,
      totpEnabledAt: new Date().toISOString(),
    });

    console.log(`\n=== ${account.role} ===`);
    console.log(`Email:    ${account.email}`);
    console.log(`Password: ${account.password}`);
    console.log(`TOTP secret: ${totpSecret}`);
    console.log(`otpauth URL: ${otpauthUrl}`);
    console.log(`Current valid code (for immediate testing, expires in ~30s): ${currentCode}`);
  }

  await db.write();
  console.log("\nDone. Restart the dev server if it's already running so it picks up the new users.");
}

main();
