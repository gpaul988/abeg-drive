import { NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { getDriverProfile, updateDriverProfile } from "@/lib/repositories/driverRepository";
import { recordAuditLog } from "@/lib/repositories/auditLogRepository";

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const { userId } = await params;
  const profile = await getDriverProfile(userId);
  if (!profile) {
    return NextResponse.json({ error: "driver_not_found" }, { status: 404 });
  }
  if (profile.applicationStatus !== "under_review") {
    return NextResponse.json({ error: "not_awaiting_review" }, { status: 409 });
  }

  const updated = await updateDriverProfile(userId, {
    applicationStatus: "approved",
    backgroundCheckStatus: "cleared",
  });

  await recordAuditLog({
    actor: auth.user,
    action: "driver_verification_approved",
    targetType: "driver",
    targetId: userId,
  });

  return NextResponse.json({ profile: updated });
}
