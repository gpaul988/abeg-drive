import { randomUUID } from "crypto";
import { getDb } from "../db";
import { VenuePartner } from "../types";

export async function createVenuePartner(input: {
  ownerUserId: string;
  venueName: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
}): Promise<VenuePartner> {
  const db = await getDb();
  const venue: VenuePartner = {
    id: randomUUID(),
    ownerUserId: input.ownerUserId,
    venueName: input.venueName,
    address: input.address,
    contactPerson: input.contactPerson,
    contactPhone: input.contactPhone,
    // Phase 1 launch strategy (spec section 1): whitelisted venues only.
    // New signups start un-whitelisted pending manual ops approval.
    whitelisted: false,
    createdAt: new Date().toISOString(),
  };
  db.data.venuePartners.push(venue);
  await db.write();
  return venue;
}

export async function findVenuePartnerByOwner(ownerUserId: string): Promise<VenuePartner | undefined> {
  const db = await getDb();
  return db.data.venuePartners.find((v) => v.ownerUserId === ownerUserId);
}

export async function listVenuePartners(): Promise<VenuePartner[]> {
  const db = await getDb();
  return db.data.venuePartners.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getVenuePartner(id: string): Promise<VenuePartner | undefined> {
  const db = await getDb();
  return db.data.venuePartners.find((v) => v.id === id);
}

export async function updateVenuePartner(id: string, patch: Partial<VenuePartner>): Promise<VenuePartner | undefined> {
  const db = await getDb();
  const venue = db.data.venuePartners.find((v) => v.id === id);
  if (!venue) return undefined;
  Object.assign(venue, patch);
  await db.write();
  return venue;
}
