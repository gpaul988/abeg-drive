import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/requireRole";
import { listDriverProfiles, updateDriverProfile, getDriverProfile } from "@/lib/repositories/driverRepository";
import { listUsersByRole } from "@/lib/repositories/userRepository";
import { recordAuditLog } from "@/lib/repositories/auditLogRepository";

export async function GET(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const [profiles, users] = await Promise.all([listDriverProfiles(), listUsersByRole("driver")]);
  const userMap = new Map(users.map((u) => [u.id, u]));

  const drivers = profiles.map((p) => ({
    ...p,
    email: userMap.get(p.userId)?.email,
    phone: userMap.get(p.userId)?.phone,
  }));

  return NextResponse.json({ drivers });
}

const suspendSchema = z.object({ userId: z.string().uuid(), reason: z.string().min(3) });

// Suspension tool, folded into the same route via PATCH rather than a
// separate endpoint — kept here since it's the same directory resource the
// spec's /admin/drivers page manages.
export async function PATCH(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = suspendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const profile = await getDriverProfile(parsed.data.userId);
  if (!profile) {
    return NextResponse.json({ error: "driver_not_found" }, { status: 404 });
  }

  const updated = await updateDriverProfile(parsed.data.userId, {
    probationStatus: "suspended",
    availability: "offline",
  });

  await recordAuditLog({
    actor: auth.user,
    action: "driver_suspended",
    targetType: "driver",
    targetId: parsed.data.userId,
    details: parsed.data.reason,
  });

  return NextResponse.json({ profile: updated });
}
