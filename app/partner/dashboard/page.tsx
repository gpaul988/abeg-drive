"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Button, Card, ErrorBanner, Field, Select, SuccessBanner, TextInput } from "@/components/ui";
import { apiGet, apiPost, getSession } from "@/lib/apiClient";
import { partnerNavLinks } from "@/lib/navLinks";

interface Venue {
  id: string;
  venueName: string;
  whitelisted: boolean;
}

interface TripRow {
  id: string;
  status: string;
  guestName?: string;
  pickup: { address: string };
  destinations: { address: string }[];
  fareEstimate: number;
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

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [transmissionType, setTransmissionType] = useState<"manual" | "automatic">("automatic");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function load() {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<{ venue: Venue }>("/partner/me", session.accessToken).then(({ status, data }) => {
      if (status === 200) setVenue(data.venue);
    });
    apiGet<{ trips: TripRow[] }>("/partner/request-driver", session.accessToken).then(({ status, data }) => {
      if (status === 200) setTrips(data.trips);
    });
  }

  useEffect(load, [router]);

  async function onRequestDriver(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const session = getSession()!;
    const { status, data } = await apiPost<{ error?: string }>(
      "/partner/request-driver",
      {
        guestName,
        guestPhone,
        pickup: { label: "Venue", address: pickupAddress, point: { lat: 4.8156, lng: 7.0498 } },
        destinations: [{ label: "Destination", address: destAddress, point: { lat: 4.85, lng: 7.03 } }],
        vehicle: { make, model, plateNumber, transmissionType },
      },
      session.accessToken
    );
    setLoading(false);
    if (status !== 201) {
      setError(
        data.error === "venue_not_whitelisted"
          ? "Your venue isn't whitelisted yet — an ops team member needs to approve it first."
          : "Couldn't request a driver. Please check the details."
      );
      return;
    }
    setSuccess("Driver requested for your guest.");
    setShowForm(false);
    setGuestName("");
    setGuestPhone("");
    setPickupAddress("");
    setDestAddress("");
    setMake("");
    setModel("");
    setPlateNumber("");
    load();
  }

  if (!venue) {
    return (
      <AppShell navLinks={partnerNavLinks} activeHref="/partner/dashboard" roleLabel="Venue Partner">
        <p className="text-paper-faint text-sm">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell navLinks={partnerNavLinks} activeHref="/partner/dashboard" roleLabel="Venue Partner">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-paper">{venue.venueName}</h1>
          <Badge tone={venue.whitelisted ? "success" : "warning"}>
            {venue.whitelisted ? "Whitelisted" : "Pending approval"}
          </Badge>
        </div>
        {venue.whitelisted && <Button onClick={() => setShowForm((s) => !s)}>Request a driver</Button>}
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {!venue.whitelisted && (
        <Card className="mb-6">
          <p className="text-sm text-paper-dim">
            Your venue is under review. Once whitelisted by our ops team, you&apos;ll be able to request drivers on
            behalf of your guests — part of our Phase 1 safety-first launch strategy.
          </p>
        </Card>
      )}

      {showForm && (
        <Card className="mb-6">
          <h2 className="font-medium text-paper mb-4">Request a driver for a guest</h2>
          <form onSubmit={onRequestDriver}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Guest name">
                <TextInput value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
              </Field>
              <Field label="Guest phone">
                <TextInput value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="080XXXXXXXX" required />
              </Field>
            </div>
            <Field label="Pickup address">
              <TextInput value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} required />
            </Field>
            <Field label="Destination address">
              <TextInput value={destAddress} onChange={(e) => setDestAddress(e.target.value)} required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Vehicle make">
                <TextInput value={make} onChange={(e) => setMake(e.target.value)} required />
              </Field>
              <Field label="Vehicle model">
                <TextInput value={model} onChange={(e) => setModel(e.target.value)} required />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Plate number">
                <TextInput value={plateNumber} onChange={(e) => setPlateNumber(e.target.value.toUpperCase())} required />
              </Field>
              <Field label="Transmission">
                <Select value={transmissionType} onChange={(e) => setTransmissionType(e.target.value as "manual" | "automatic")}>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </Select>
              </Field>
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Request driver
            </Button>
          </form>
        </Card>
      )}

      <h2 className="font-medium text-paper mb-3">Requests</h2>
      <div className="space-y-3">
        {trips.map((t) => (
          <Card key={t.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-paper">{t.guestName}</span>
              <Badge tone={STATUS_TONE[t.status] ?? "neutral"}>{t.status.replace("_", " ")}</Badge>
            </div>
            <p className="text-sm text-paper-dim truncate">{t.pickup.address}</p>
            <p className="text-sm text-paper-dim truncate">→ {t.destinations[0]?.address}</p>
          </Card>
        ))}
        {trips.length === 0 && <p className="text-sm text-paper-faint">No requests yet.</p>}
      </div>
    </AppShell>
  );
}
