import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { listActiveSessionsForUser } from "@/lib/repositories/userRepository";

export async function GET(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const sessions = await listActiveSessionsForUser(auth.user.id);

  // Never return the raw token — the record's own id is the safe
  // identifier the frontend uses to request revocation.
  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      userAgent: s.userAgent ?? "Unknown device",
    })),
  });
}
