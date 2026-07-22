import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { loadTripForUser } from "@/lib/tripAccess";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const result = await loadTripForUser(id, auth.user);
  if ("error" in result) return result.error;

  return NextResponse.json({ trip: result.trip });
}
