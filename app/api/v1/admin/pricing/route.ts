import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/requireRole";
import { getPricingConfig, updatePricingConfig } from "@/lib/repositories/pricingRepository";
import { recordAuditLog } from "@/lib/repositories/auditLogRepository";

export async function GET(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const config = await getPricingConfig();
  return NextResponse.json({ config });
}

const schema = z.object({
  baseFare: z.number().positive().optional(),
  perKmRate: z.number().positive().optional(),
  escortSurcharge: z.number().nonnegative().optional(),
  surgeEnabled: z.boolean().optional(),
  surgeMultiplier: z.number().min(1).max(5).optional(),
  corporateDiscountPct: z.number().min(0).max(50).optional(),
});

export async function PUT(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const config = await updatePricingConfig(parsed.data);

  await recordAuditLog({
    actor: auth.user,
    action: "pricing_updated",
    targetType: "pricing_config",
    targetId: "global",
    details: JSON.stringify(parsed.data),
  });

  return NextResponse.json({ config });
}
