import { NextResponse } from "next/server";
import { BaseUser, UserRole } from "./types";
import { requireUser } from "./requireAuth";

// Confirms the requester holds one of the given internal roles. Used by
// every /admin/* and security-agent-facing route. Distinct from
// requireUser (which only checks the token is valid) — this additionally
// enforces the principle of least privilege between Platform Admin/Super
// Admin (financial + verification access) and Security Agent (incident +
// live-trip access only, per the role split agreed for this build).
export async function requireRole(
  req: Request,
  allowedRoles: UserRole[]
): Promise<{ user: BaseUser } | { error: NextResponse }> {
  const result = await requireUser(req);
  if ("error" in result) return result;

  if (!allowedRoles.includes(result.user.role)) {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { user: result.user };
}
