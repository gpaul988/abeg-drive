// Dev persistence layer.
//
// NOTE ON PRODUCTION: the spec calls for PostgreSQL + PostGIS. This sandbox
// environment cannot compile native modules (no libpq / node-gyp toolchain
// reachable) or download Prisma's engine binaries (network is allowlisted to
// npm/github only), so local dev here uses lowdb (a JSON file) behind this
// same repository-style API. Swapping to Postgres in production means
// re-implementing the functions in this file against `pg`/an ORM — nothing
// in the routes or pages needs to change, since they only import from
// lib/repositories/*, never touch storage directly.

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import {
  BaseUser,
  CustomerProfile,
  OtpRecord,
  RefreshTokenRecord,
  DriverProfile,
  Trip,
  Incident,
  BondFundLedgerEntry,
  CorporateAccount,
  VenuePartner,
} from "./types";

interface DbSchema {
  users: BaseUser[];
  customerProfiles: CustomerProfile[];
  otps: OtpRecord[];
  refreshTokens: RefreshTokenRecord[];
  driverProfiles: DriverProfile[];
  trips: Trip[];
  incidents: Incident[];
  bondFundLedger: BondFundLedgerEntry[];
  corporateAccounts: CorporateAccount[];
  venuePartners: VenuePartner[];
  auditLog: AuditLogEntry[];
  pricingConfig: PricingConfig;
}

export interface PricingConfig {
  baseFare: number;
  perKmRate: number;
  escortSurcharge: number;
  surgeEnabled: boolean;
  surgeMultiplier: number;
  corporateDiscountPct: number;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorUserId: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  createdAt: string;
}

const defaultData: DbSchema = {
  users: [],
  customerProfiles: [],
  otps: [],
  refreshTokens: [],
  driverProfiles: [],
  trips: [],
  incidents: [],
  bondFundLedger: [],
  corporateAccounts: [],
  venuePartners: [],
  auditLog: [],
  pricingConfig: {
    baseFare: 1500,
    perKmRate: 250,
    escortSurcharge: 1000,
    surgeEnabled: false,
    surgeMultiplier: 1.5,
    corporateDiscountPct: 0,
    updatedAt: new Date(0).toISOString(),
  },
};

const file = path.join(process.cwd(), "data", "db.json");
const adapter = new JSONFile<DbSchema>(file);
const db = new Low<DbSchema>(adapter, defaultData);

let initialized = false;
async function ensureInit() {
  if (initialized) return;
  await db.read();
  db.data ||= defaultData;
  db.data.pricingConfig ||= defaultData.pricingConfig;
  initialized = true;
}

export async function getDb() {
  await ensureInit();
  return db;
}
