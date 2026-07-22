import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/requireRole";
import { getDriverProfile, updateDriverProfile } from "@/lib/repositories/driverRepository";
import { recordAuditLog } from "@/lib/repositories/auditLogRepository";

const schema = z.object({ reason: z.string().min(3, "Please provide a reason for rejection") });

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const { userId } = await params;
  const profile = await getDriverProfile(userId);
  if (!profile) {
    return NextResponse.json({ error: "driver_not_found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateDriverProfile(userId, {
    applicationStatus: "rejected",
    backgroundCheckStatus: "flagged",
  });

  await recordAuditLog({
    actor: auth.user,
    action: "driver_verification_rejected",
    targetType: "driver",
    targetId: userId,
    details: parsed.data.reason,
  });

  return NextResponse.json({ profile: updated });
}
