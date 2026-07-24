import { randomUUID } from "crypto";
import { getDb } from "../db";
import { ContactMessage, ContactCategory } from "../types";

export async function createContactMessage(input: {
  name: string;
  email: string;
  phone?: string;
  category: ContactCategory;
  message: string;
}): Promise<ContactMessage> {
  const db = await getDb();
  const entry: ContactMessage = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    phone: input.phone,
    category: input.category,
    message: input.message,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  db.data.contactMessages.push(entry);
  await db.write();
  return entry;
}

export async function listContactMessages(status?: ContactMessage["status"]): Promise<ContactMessage[]> {
  const db = await getDb();
  const all = db.data.contactMessages.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return status ? all.filter((m) => m.status === status) : all;
}

export async function getContactMessage(id: string): Promise<ContactMessage | undefined> {
  const db = await getDb();
  return db.data.contactMessages.find((m) => m.id === id);
}

export async function updateContactMessage(
  id: string,
  patch: Partial<ContactMessage>
): Promise<ContactMessage | undefined> {
  const db = await getDb();
  const entry = db.data.contactMessages.find((m) => m.id === id);
  if (!entry) return undefined;
  Object.assign(entry, patch);
  await db.write();
  return entry;
}
