"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Button, Card, ErrorBanner } from "@/components/ui";
import { apiGet, apiPut, getSession } from "@/lib/apiClient";
import { driverNavLinks } from "@/lib/navLinks";

interface DriverMeTrip {
  id: string;
  status: string;
  pickup: { address: string };
  destinations: { address: string }[];
  fareEstimate: number;
}

export default function DriverDashboardPage() {
  const router = useRouter();
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [availability, setAvailability] = useState<"offline" | "online" | "on_trip">("offline");
  const [trips, setTrips] = useState<DriverMeTrip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function load() {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<{ probationStatus: string }>("/drivers/me/probation-status", session.accessToken).then(
      ({ status }) => {
        setApplicationStatus(status === 404 ? "not_started" : "found");
      }
    );
    apiGet<{ trips: DriverMeTrip[] }>("/trips", session.accessToken).then(({ status, data }) => {
      if (status === 200) {
        setTrips(data.trips.filter((t) => !["completed", "cancelled"].includes(t.status)));
      }
    });
  }

  useEffect(load, [router]);

  async function toggleAvailability() {
    setError(null);
    setLoading(true);
    const session = getSession()!;
    const next = availability === "offline" ? "online" : "offline";
    const { status, data } = await apiPut<{ availability?: string; error?: string }>(
      "/drivers/me/availability",
      { availability: next },
      session.accessToken
    );
    setLoading(false);
    if (status !== 200) {
      setError(
        data.error === "application_not_approved"
          ? "Your application must be approved before you can go online."
          : "Couldn't update your availability. Please try again."
      );
      return;
    }
    setAvailability(next as "online" | "offline");
  }

  return (
    <AppShell navLinks={driverNavLinks} activeHref="/driver/dashboard" roleLabel="Driver">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-paper">Driver dashboard</h1>
        <Button
          variant={availability === "online" ? "danger" : "primary"}
          loading={loading}
          onClick={toggleAvailability}
        >
          {availability === "online" ? "Go offline" : "Go online"}
        </Button>
      </div>

      <ErrorBanner message={error} />

      {applicationStatus === "not_started" && (
        <Card className="mb-6">
          <p className="text-sm text-paper-dim">
            You haven&apos;t completed your driver application yet.{" "}
            <a href="/driver/onboarding" className="text-amber-strong font-medium">
              Complete it now →
            </a>
          </p>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-sm text-paper-dim mb-1">Availability</p>
          <Badge tone={availability === "online" ? "success" : "neutral"}>{availability}</Badge>
        </Card>
        <Card>
          <p className="text-sm text-paper-dim mb-1">Active trips</p>
          <p className="font-semibold text-paper">{trips.length}</p>
        </Card>
        <a href="/driver/probation-status">
          <Card className="hover:border-ink-border-strong">
            <p className="text-sm text-paper-dim mb-1">Application status</p>
            <p className="font-medium text-amber-strong text-sm">View progress →</p>
          </Card>
        </a>
      </div>

      <h2 className="font-medium text-paper mb-3">Current trips</h2>
      {trips.length === 0 && <p className="text-sm text-paper-faint">No active trips right now.</p>}
      <div className="space-y-3">
        {trips.map((trip) => (
          <a key={trip.id} href={`/driver/trip/${trip.id}`}>
            <Card className="hover:border-ink-border-strong">
              <div className="flex items-center justify-between mb-2">
                <Badge tone="info">{trip.status.replace("_", " ")}</Badge>
                <span className="text-sm font-medium text-paper">
                  ₦{trip.fareEstimate.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-paper truncate">{trip.pickup.address}</p>
              <p className="text-sm text-paper-dim truncate">→ {trip.destinations[0]?.address}</p>
            </Card>
          </a>
        ))}
      </div>
    </AppShell>
  );
}
