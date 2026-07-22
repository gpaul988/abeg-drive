import { randomUUID } from "crypto";
import { getDb } from "../db";
import { Incident, IncidentType } from "../types";

export async function createIncident(input: {
  tripId: string;
  triggeredBy: "customer" | "driver";
  type: IncidentType;
}): Promise<Incident> {
  const db = await getDb();
  const incident: Incident = {
    id: randomUUID(),
    tripId: input.tripId,
    triggeredBy: input.triggeredBy,
    type: input.type,
    status: "open",
    escalatedToSecurityPartner: input.type === "panic" || input.type === "accident",
    createdAt: new Date().toISOString(),
  };
  db.data.incidents.push(incident);
  await db.write();
  return incident;
}

export async function getIncident(id: string): Promise<Incident | undefined> {
  const db = await getDb();
  return db.data.incidents.find((i) => i.id === id);
}

export async function listIncidents(status?: Incident["status"]): Promise<Incident[]> {
  const db = await getDb();
  const all = db.data.incidents.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return status ? all.filter((i) => i.status === status) : all;
}

export async function updateIncident(id: string, patch: Partial<Incident>): Promise<Incident | undefined> {
  const db = await getDb();
  const incident = db.data.incidents.find((i) => i.id === id);
  if (!incident) return undefined;
  Object.assign(incident, patch);
  await db.write();
  return incident;
}
