import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/requireRole";
import { getIncident, updateIncident } from "@/lib/repositories/incidentRepository";
import { recordClaimPayout, getBondFundBalance } from "@/lib/repositories/bondFundRepository";
import { recordAuditLog } from "@/lib/repositories/auditLogRepository";

const schema = z.object({ amount: z.number().positive() });

export async function POST(req: Request, { params }: { params: Promise<{ incidentId: string }> }) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const { incidentId } = await params;
  const incident = await getIncident(incidentId);
  if (!incident) {
    return NextResponse.json({ error: "incident_not_found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const currentBalance = await getBondFundBalance();
  if (parsed.data.amount > currentBalance) {
    return NextResponse.json({ error: "insufficient_bond_fund_balance", currentBalance }, { status: 409 });
  }

  const entry = await recordClaimPayout(incidentId, incident.tripId, parsed.data.amount);
  await updateIncident(incidentId, { status: "resolved", resolvedAt: new Date().toISOString() });

  await recordAuditLog({
    actor: auth.user,
    action: "bond_fund_claim_paid",
    targetType: "incident",
    targetId: incidentId,
    details: `Paid out ${parsed.data.amount}`,
  });

  return NextResponse.json({ ledgerEntry: entry });
}
