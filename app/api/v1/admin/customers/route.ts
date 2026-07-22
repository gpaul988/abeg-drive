import { NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { listUsersByRole, getCustomerProfile } from "@/lib/repositories/userRepository";

export async function GET(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const users = await listUsersByRole("customer");
  const customers = await Promise.all(
    users.map(async (u) => {
      const profile = await getCustomerProfile(u.id);
      return {
        userId: u.id,
        email: u.email,
        phone: u.phone,
        verificationStatus: u.verificationStatus,
        trustScore: profile?.trustScore ?? 100,
        // Flagged: trust score has dropped meaningfully from the default
        // 100, indicating a pattern of no-shows/cancellations/poor ratings
        // per the Customer.trust_score field in SPEC.md section 4.
        flagged: (profile?.trustScore ?? 100) < 60,
        createdAt: u.createdAt,
      };
    })
  );

  return NextResponse.json({ customers });
}
