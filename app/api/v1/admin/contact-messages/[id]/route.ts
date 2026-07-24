import { NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { contactMessageUpdateSchema } from "@/lib/validation";
import { getContactMessage, updateContactMessage } from "@/lib/repositories/contactRepository";
import { recordAuditLog } from "@/lib/repositories/auditLogRepository";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const existing = await getContactMessage(id);
  if (!existing) {
    return NextResponse.json({ error: "message_not_found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = contactMessageUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const patch: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === "resolved") patch.resolvedAt = new Date().toISOString();

  const updated = await updateContactMessage(id, patch);

  await recordAuditLog({
    actor: auth.user,
    action: "contact_message_triaged",
    targetType: "contact_message",
    targetId: id,
    details: JSON.stringify(parsed.data),
  });

  return NextResponse.json({ message: updated });
}
