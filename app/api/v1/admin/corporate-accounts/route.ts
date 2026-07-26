import { NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { listCorporateAccounts } from "@/lib/repositories/corporateRepository";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const accounts = await listCorporateAccounts();
  const db = await getDb();

  const enriched = accounts.map((a) => {
    const employeeTrips = db.data.trips.filter(
      (t) => a.employeeUserIds.includes(t.customerId) && t.status === "completed"
    );
    return {
      id: a.id,
      companyName: a.companyName,
      rcNumber: a.rcNumber,
      billingContact: a.billingContact,
      employeeCount: a.employeeUserIds.length,
      totalTrips: employeeTrips.length,
      totalSpend: employeeTrips.reduce((sum, t) => sum + (t.fareFinal ?? t.fareEstimate), 0),
      createdAt: a.createdAt,
    };
  });

  return NextResponse.json({ accounts: enriched });
}
