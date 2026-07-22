import { randomUUID } from "crypto";
import { getDb } from "../db";
import { AuditLogEntry } from "../db";
import { BaseUser } from "../types";

export async function recordAuditLog(input: {
  actor: BaseUser;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
}): Promise<AuditLogEntry> {
  const db = await getDb();
  const entry: AuditLogEntry = {
    id: randomUUID(),
    actorUserId: input.actor.id,
    actorRole: input.actor.role,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    details: input.details,
    createdAt: new Date().toISOString(),
  };
  // Immutability note: this dev store has no update/delete function for
  // auditLog entries — only append. Production would additionally write to
  // an append-only table with revoked UPDATE/DELETE grants, or a
  // write-once log service, so immutability is enforced at the database
  // layer, not just by omission in the application code.
  db.data.auditLog.push(entry);
  await db.write();
  return entry;
}

export async function listAuditLog(): Promise<AuditLogEntry[]> {
  const db = await getDb();
  return db.data.auditLog.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
