import { randomUUID } from "crypto";
import { getDb } from "../db";
import { BondFundLedgerEntry } from "../types";

const BOND_FUND_CONTRIBUTION_RATE = 0.03; // 3% of every trip fare, per spec section 6

export async function recordBondFundContribution(tripId: string, fareAmount: number): Promise<BondFundLedgerEntry> {
  const db = await getDb();
  const currentBalance = db.data.bondFundLedger.at(-1)?.runningBalance ?? 0;
  const contribution = Math.round(fareAmount * BOND_FUND_CONTRIBUTION_RATE * 100) / 100;
  const entry: BondFundLedgerEntry = {
    id: randomUUID(),
    tripId,
    contributionAmount: contribution,
    runningBalance: Math.round((currentBalance + contribution) * 100) / 100,
    createdAt: new Date().toISOString(),
  };
  db.data.bondFundLedger.push(entry);
  await db.write();
  return entry;
}

export async function getBondFundBalance(): Promise<number> {
  const db = await getDb();
  return db.data.bondFundLedger.at(-1)?.runningBalance ?? 0;
}

export async function listBondFundLedger(): Promise<BondFundLedgerEntry[]> {
  const db = await getDb();
  return db.data.bondFundLedger.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function recordClaimPayout(incidentId: string, tripId: string, amount: number): Promise<BondFundLedgerEntry> {
  const db = await getDb();
  const currentBalance = db.data.bondFundLedger.at(-1)?.runningBalance ?? 0;
  const entry: BondFundLedgerEntry = {
    id: randomUUID(),
    tripId,
    contributionAmount: -Math.abs(amount),
    runningBalance: Math.round((currentBalance - amount) * 100) / 100,
    claimId: incidentId,
    createdAt: new Date().toISOString(),
  };
  db.data.bondFundLedger.push(entry);
  await db.write();
  return entry;
}
