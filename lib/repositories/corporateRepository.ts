import { randomUUID } from "crypto";
import { getDb } from "../db";
import { CorporateAccount } from "../types";

export async function createCorporateAccount(input: {
  ownerUserId: string;
  companyName: string;
  rcNumber: string;
  billingContact: string;
}): Promise<CorporateAccount> {
  const db = await getDb();
  const account: CorporateAccount = {
    id: randomUUID(),
    ownerUserId: input.ownerUserId,
    companyName: input.companyName,
    rcNumber: input.rcNumber,
    billingContact: input.billingContact,
    employeeUserIds: [],
    createdAt: new Date().toISOString(),
  };
  db.data.corporateAccounts.push(account);
  await db.write();
  return account;
}

export async function getCorporateAccount(id: string): Promise<CorporateAccount | undefined> {
  const db = await getDb();
  return db.data.corporateAccounts.find((c) => c.id === id);
}

export async function listCorporateAccounts(): Promise<CorporateAccount[]> {
  const db = await getDb();
  return db.data.corporateAccounts;
}

export async function updateCorporateAccount(
  id: string,
  patch: Partial<CorporateAccount>
): Promise<CorporateAccount | undefined> {
  const db = await getDb();
  const account = db.data.corporateAccounts.find((c) => c.id === id);
  if (!account) return undefined;
  Object.assign(account, patch);
  await db.write();
  return account;
}

export async function addEmployeeToCorporateAccount(
  corporateId: string,
  userId: string
): Promise<CorporateAccount | undefined> {
  const db = await getDb();
  const account = db.data.corporateAccounts.find((c) => c.id === corporateId);
  if (!account) return undefined;
  if (!account.employeeUserIds.includes(userId)) {
    account.employeeUserIds.push(userId);
  }
  await db.write();
  return account;
}

export async function removeEmployeeFromCorporateAccount(
  corporateId: string,
  userId: string
): Promise<CorporateAccount | undefined> {
  const db = await getDb();
  const account = db.data.corporateAccounts.find((c) => c.id === corporateId);
  if (!account) return undefined;
  account.employeeUserIds = account.employeeUserIds.filter((id) => id !== userId);
  await db.write();
  return account;
}

export async function findCorporateAccountByOwner(ownerUserId: string): Promise<CorporateAccount | undefined> {
  const db = await getDb();
  return db.data.corporateAccounts.find((c) => c.ownerUserId === ownerUserId);
}
