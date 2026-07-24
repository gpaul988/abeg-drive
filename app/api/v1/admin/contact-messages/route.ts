import { NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { listContactMessages } from "@/lib/repositories/contactRepository";
import { ContactMessageStatus } from "@/lib/types";

export async function GET(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status") as ContactMessageStatus | null;

  const messages = await listContactMessages(statusFilter ?? undefined);
  return NextResponse.json({ messages });
}
