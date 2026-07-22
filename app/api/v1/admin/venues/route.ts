import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/requireRole";
import { listVenuePartners, updateVenuePartner } from "@/lib/repositories/venueRepository";
import { recordAuditLog } from "@/lib/repositories/auditLogRepository";

export async function GET(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const venues = await listVenuePartners();
  return NextResponse.json({ venues });
}

const schema = z.object({ venueId: z.string().uuid(), whitelisted: z.boolean() });

export async function PATCH(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateVenuePartner(parsed.data.venueId, { whitelisted: parsed.data.whitelisted });
  if (!updated) {
    return NextResponse.json({ error: "venue_not_found" }, { status: 404 });
  }

  await recordAuditLog({
    actor: auth.user,
    action: parsed.data.whitelisted ? "venue_whitelisted" : "venue_delisted",
    targetType: "venue",
    targetId: parsed.data.venueId,
  });

  return NextResponse.json({ venue: updated });
}
