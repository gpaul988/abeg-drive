import { NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { listAuditLog } from "@/lib/repositories/auditLogRepository";

export async function GET(req: Request) {
  // Audit log visibility is Super Admin only — even Platform Admin staff
  // shouldn't be able to review (and potentially reason about evading)
  // the log of admin actions, including their own.
  const auth = await requireRole(req, ["super_admin"]);
  if ("error" in auth) return auth.error;

  const entries = await listAuditLog();
  return NextResponse.json({ entries });
}
