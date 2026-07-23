import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { loadCorporateAccountForUser } from "@/lib/corporateAccess";
import { getDb } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const result = await loadCorporateAccountForUser(id, auth.user);
  if ("error" in result) return result.error;
  const { account } = result;

  const db = await getDb();
  const employeeTrips = db.data.trips.filter(
    (t) => account.employeeUserIds.includes(t.customerId) && t.status === "completed"
  );

  const totalSpend = employeeTrips.reduce((sum, t) => sum + (t.fareFinal ?? t.fareEstimate), 0);

  // MVP: no real invoicing/payment-terms engine — this returns a computed
  // usage summary in place of generated PDF invoices, which would be a
  // post-MVP addition (e.g. monthly billing cycle via Paystack invoicing).
  return NextResponse.json({
    companyName: account.companyName,
    billingContact: account.billingContact,
    totalTrips: employeeTrips.length,
    totalSpend,
    trips: employeeTrips.map((t) => ({
      id: t.id,
      customerId: t.customerId,
      fare: t.fareFinal ?? t.fareEstimate,
      completedAt: t.completedAt,
    })),
  });
}
