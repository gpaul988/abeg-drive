"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell, Badge, Button, Card, ErrorBanner, SuccessBanner } from "@/components/ui";
import { apiGet, apiPost, getSession } from "@/lib/apiClient";
import { driverNavLinks } from "@/lib/navLinks";

interface TripDetail {
  id: string;
  status: string;
  pickup: { address: string; point: { lat: number; lng: number } };
  destinations: { address: string }[];
  vehicleSnapshot: { make: string; model: string; plateNumber: string; transmissionType: string };
  fareEstimate: number;
  driverPrimaryId?: string;
  driverEscortId?: string;
}

export default function DriverTripPage() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    const { status, data } = await apiGet<{ trip: TripDetail }>(`/trips/${params.tripId}`, session.accessToken);
    if (status === 200) {
      setTrip(data.trip);
      setIsPrimary(data.trip.driverPrimaryId === session.userId);
    }
  }, [params.tripId, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function onAccept() {
    setError(null);
    setLoading(true);
    const session = getSession()!;
    const { status } = await apiPost(`/drivers/me/trips/${params.tripId}/accept`, {}, session.accessToken);
    setLoading(false);
    if (status !== 200) {
      setError("Couldn't accept this trip — it may have already been reassigned.");
      return;
    }
    setSuccess("Trip accepted. Head to the pickup location.");
    load();
  }

  async function onDecline() {
    if (!confirm("Decline this trip? It will be reassigned to another driver.")) return;
    setError(null);
    setLoading(true);
    const session = getSession()!;
    const { status } = await apiPost(`/drivers/me/trips/${params.tripId}/decline`, {}, session.accessToken);
    setLoading(false);
    if (status !== 200) {
      setError("Couldn't decline this trip.");
      return;
    }
    router.push("/driver/dashboard");
  }

  async function onSendLocationPing() {
    const session = getSession()!;
    // In production this fires automatically every few seconds from the
    // device GPS while the trip is active; here it's a manual trigger for
    // demo/testing purposes.
    await apiPost(
      `/drivers/me/trips/${params.tripId}/location-ping`,
      { point: trip!.pickup.point },
      session.accessToken
    );
    setSuccess("Location updated.");
  }

  async function onComplete() {
    setError(null);
    setLoading(true);
    const session = getSession()!;
    const { status } = await apiPost(`/drivers/me/trips/${params.tripId}/complete`, {}, session.accessToken);
    setLoading(false);
    if (status !== 200) {
      setError("Couldn't complete this trip. Make sure it's in progress first.");
      return;
    }
    router.push("/driver/dashboard");
  }

  async function onPanic() {
    if (!confirm("This will alert our security response team immediately. Continue?")) return;
    setError(null);
    const session = getSession()!;
    const { status } = await apiPost(`/trips/${params.tripId}/panic`, { triggeredBy: "driver" }, session.accessToken);
    if (status !== 201) {
      setError("Couldn't send the alert.");
      return;
    }
    setSuccess("Alert sent. Security response is being dispatched.");
    load();
  }

  if (!trip) {
    return (
      <AppShell navLinks={driverNavLinks} activeHref="/driver/dashboard" roleLabel="Driver">
        <p className="text-paper-faint text-sm">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell navLinks={driverNavLinks} activeHref="/driver/dashboard" roleLabel="Driver">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-paper">Trip details</h1>
          <Badge tone="info">{trip.status.replace("_", " ")}</Badge>
        </div>

        <ErrorBanner message={error} />
        <SuccessBanner message={success} />

        <Card className="mb-4">
          <div className="space-y-2 text-sm mb-4">
            <div className="flex gap-2">
              <span className="w-2 h-2 mt-1.5 rounded-full bg-paper shrink-0" />
              <span className="text-paper-dim">{trip.pickup.address}</span>
            </div>
            {trip.destinations.map((d, i) => (
              <div key={i} className="flex gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-amber shrink-0" />
                <span className="text-paper-dim">{d.address}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-ink-border pt-4 text-sm">
            <p className="text-paper-dim">Customer&apos;s vehicle</p>
            <p className="text-paper">
              {trip.vehicleSnapshot.make} {trip.vehicleSnapshot.model} — {trip.vehicleSnapshot.plateNumber} (
              {trip.vehicleSnapshot.transmissionType})
            </p>
            <p className="text-paper-dim mt-2">Fare</p>
            <p className="text-paper font-medium">₦{trip.fareEstimate.toLocaleString()}</p>
          </div>
        </Card>

        <div className="space-y-3">
          {trip.status === "matched" && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" loading={loading} onClick={onDecline}>
                Decline
              </Button>
              <Button loading={loading} onClick={onAccept}>
                Accept
              </Button>
            </div>
          )}

          {trip.status === "en_route" && isPrimary && (
            <>
              <Button className="w-full" onClick={onSendLocationPing}>
                Send location update
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => router.push(`/driver/trip/${trip.id}/start-verification`)}
              >
                Arrived — start trip (selfie verify)
              </Button>
            </>
          )}

          {trip.status === "en_route" && !isPrimary && (
            <p className="text-sm text-paper-dim text-center">
              You&apos;re the escort driver on this trip — follow the primary driver to the destination.
            </p>
          )}

          {trip.status === "in_progress" && isPrimary && (
            <Button className="w-full" loading={loading} onClick={onComplete}>
              Complete trip
            </Button>
          )}

          {["en_route", "in_progress"].includes(trip.status) && (
            <Button variant="danger" className="w-full" onClick={onPanic}>
              🚨 Panic button
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
