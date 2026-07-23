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
  const employeeTrips = db.data.trips.filter((t) => account.employeeUserIds.includes(t.customerId));
  const employeeIncidents = db.data.incidents.filter((i) => {
    const trip = db.data.trips.find((t) => t.id === i.tripId);
    return trip && account.employeeUserIds.includes(trip.customerId);
  });

  // Framed for oil & gas / bank safety-policy compliance reporting, per
  // spec section 3.5 — a corporate safety officer can show this to their
  // own compliance team without needing platform admin access.
  return NextResponse.json({
    companyName: account.companyName,
    generatedAt: new Date().toISOString(),
    totalEmployees: account.employeeUserIds.length,
    totalTrips: employeeTrips.length,
    completedTrips: employeeTrips.filter((t) => t.status === "completed").length,
    cancelledTrips: employeeTrips.filter((t) => t.status === "cancelled").length,
    incidentsInvolvingEmployees: employeeIncidents.length,
    averageFare:
      employeeTrips.length > 0
        ? Math.round(
            employeeTrips.reduce((sum, t) => sum + (t.fareFinal ?? t.fareEstimate), 0) / employeeTrips.length
          )
        : 0,
  });
}
