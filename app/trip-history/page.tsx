"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { customerNavLinks } from "@/lib/navLinks";

interface Trip {
  id: string;
  pickup: { address: string };
  destinations: { address: string }[];
  status: string;
  fareEstimate: number;
  fareFinal?: number;
  createdAt: string;
}

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral" | "info"> = {
  requested: "warning",
  matched: "info",
  en_route: "info",
  in_progress: "success",
  completed: "success",
  cancelled: "neutral",
  incident: "danger",
};

export default function TripHistoryPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[] | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<{ trips: Trip[] }>("/trips", session.accessToken).then(({ status, data }) => {
      if (status === 200) setTrips(data.trips);
    });
  }, [router]);

  return (
    <AppShell navLinks={customerNavLinks} activeHref="/trip-history" roleLabel="Customer">
      <h1 className="text-xl font-semibold text-paper mb-6">Trip history</h1>
      {!trips && <p className="text-paper-faint text-sm">Loading…</p>}
      {trips && trips.length === 0 && <p className="text-paper-faint text-sm">No trips yet.</p>}
      <div className="space-y-3">
        {trips?.map((trip) => (
          <Card
            key={trip.id}
            className="cursor-pointer hover:border-ink-border-strong"
          >
            <a href={trip.status === "completed" ? `/trip/${trip.id}/receipt` : `/book/tracking/${trip.id}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-paper-faint">
                  {new Date(trip.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                </span>
                <Badge tone={STATUS_TONE[trip.status] ?? "neutral"}>{trip.status.replace("_", " ")}</Badge>
              </div>
              <p className="text-sm text-paper truncate">{trip.pickup.address}</p>
              <p className="text-sm text-paper-dim truncate">→ {trip.destinations[0]?.address}</p>
              <p className="text-sm font-medium text-paper mt-2">
                ₦{(trip.fareFinal ?? trip.fareEstimate).toLocaleString()}
              </p>
            </a>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
