import { NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { getDb } from "@/lib/db";
import { listDriverProfiles } from "@/lib/repositories/driverRepository";
import { listIncidents } from "@/lib/repositories/incidentRepository";
import { recordAuditLog } from "@/lib/repositories/auditLogRepository";

export async function GET(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const db = await getDb();
  const drivers = await listDriverProfiles();
  const incidents = await listIncidents();

  // Deliberately excludes NIN/BVN/selfie references and any payment token —
  // this export is designed to be handed to an external regulator
  // (Rivers State Ministry of Transportation / FRSC) as a road-safety
  // partner, per spec section 6, not as a raw PII dump.
  const report = {
    generatedAt: new Date().toISOString(),
    totalDrivers: drivers.length,
    approvedDrivers: drivers.filter((d) => d.applicationStatus === "approved").length,
    driversInProbation: drivers.filter((d) => d.probationStatus === "in_probation").length,
    totalTrips: db.data.trips.length,
    completedTrips: db.data.trips.filter((t) => t.status === "completed").length,
    cancelledTrips: db.data.trips.filter((t) => t.status === "cancelled").length,
    totalIncidents: incidents.length,
    incidentsByType: {
      panic: incidents.filter((i) => i.type === "panic").length,
      accident: incidents.filter((i) => i.type === "accident").length,
      dispute: incidents.filter((i) => i.type === "dispute").length,
      no_show: incidents.filter((i) => i.type === "no_show").length,
    },
    incidentsResolved: incidents.filter((i) => i.status === "resolved").length,
    incidentsEscalatedToSecurityPartner: incidents.filter((i) => i.escalatedToSecurityPartner).length,
  };

  await recordAuditLog({
    actor: auth.user,
    action: "compliance_report_generated",
    targetType: "report",
    targetId: "compliance-export",
  });

  return NextResponse.json({ report });
}
