import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { revokeSessionById } from "@/lib/repositories/userRepository";

export async function POST(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const { sessionId } = await params;
  const revoked = await revokeSessionById(auth.user.id, sessionId);
  if (!revoked) {
    return NextResponse.json({ error: "session_not_found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
