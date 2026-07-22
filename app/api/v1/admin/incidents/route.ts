import { NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { listIncidents } from "@/lib/repositories/incidentRepository";
import { getTrip } from "@/lib/repositories/tripRepository";
import { findUserById } from "@/lib/repositories/userRepository";

export async function GET(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin", "security_agent"]);
  if ("error" in auth) return auth.error;

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status") as "open" | "investigating" | "resolved" | null;

  const incidents = await listIncidents(statusFilter ?? undefined);

  const enriched = await Promise.all(
    incidents.map(async (incident) => {
      const trip = await getTrip(incident.tripId);
      const customer = trip ? await findUserById(trip.customerId) : undefined;
      return {
        ...incident,
        trip: trip
          ? {
              id: trip.id,
              status: trip.status,
              pickup: trip.pickup,
              destinations: trip.destinations,
              customerPhone: customer?.phone,
              driverPrimaryId: trip.driverPrimaryId,
              livelocationPings: trip.livelocationPings.slice(-5),
            }
          : null,
      };
    })
  );

  return NextResponse.json({ incidents: enriched });
}
