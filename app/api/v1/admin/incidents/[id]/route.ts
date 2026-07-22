import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/requireRole";
import { getIncident, updateIncident } from "@/lib/repositories/incidentRepository";
import { recordAuditLog } from "@/lib/repositories/auditLogRepository";

const schema = z.object({
  status: z.enum(["open", "investigating", "resolved"]).optional(),
  resolutionNotes: z.string().min(3).optional(),
  escalatedToSecurityPartner: z.boolean().optional(),
  assignSelf: z.boolean().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(req, ["platform_admin", "super_admin", "security_agent"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const incident = await getIncident(id);
  if (!incident) {
    return NextResponse.json({ error: "incident_not_found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.status) {
    patch.status = parsed.data.status;
    if (parsed.data.status === "resolved") patch.resolvedAt = new Date().toISOString();
  }
  if (parsed.data.resolutionNotes) patch.resolutionNotes = parsed.data.resolutionNotes;
  if (parsed.data.escalatedToSecurityPartner !== undefined) {
    patch.escalatedToSecurityPartner = parsed.data.escalatedToSecurityPartner;
  }
  if (parsed.data.assignSelf) patch.assignedSecurityAgentId = auth.user.id;

  const updated = await updateIncident(id, patch);

  await recordAuditLog({
    actor: auth.user,
    action: "incident_updated",
    targetType: "incident",
    targetId: id,
    details: JSON.stringify(parsed.data),
  });

  return NextResponse.json({ incident: updated });
}
