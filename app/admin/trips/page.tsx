"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Button, Card, ErrorBanner, SuccessBanner, TextArea } from "@/components/ui";
import { apiGet, apiPut, getSession } from "@/lib/apiClient";
import { getAdminNavLinks } from "@/lib/navLinks";

interface TripRow {
  id: string;
  status: string;
  pickup: { address: string };
  destinations: { address: string }[];
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

export default function AdminTripsPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [trips, setTrips] = useState<TripRow[] | null>(null);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [fareFinal, setFareFinal] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function load() {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setRole(session.role);
    apiGet<{ trips: TripRow[] }>("/admin/trips", session.accessToken).then(({ status, data }) => {
      if (status === 200) setTrips(data.trips);
    });
  }

  useEffect(load, [router]);

  async function resolveDispute(tripId: string) {
    setError(null);
    if (!notes) {
      setError("Please add resolution notes.");
      return;
    }
    const session = getSession()!;
    const { status } = await apiPut(
      "/admin/trips",
      { tripId, fareFinal: fareFinal ? Number(fareFinal) : undefined, notes },
      session.accessToken
    );
    if (status !== 200) {
      setError("Couldn't resolve this dispute.");
      return;
    }
    setSuccess("Dispute resolved and logged to the audit trail.");
    setDisputeId(null);
    setFareFinal("");
    setNotes("");
    load();
  }

  return (
    <AppShell navLinks={getAdminNavLinks(role)} activeHref="/admin/trips" roleLabel="Admin">
      <h1 className="text-xl font-semibold text-paper mb-6">Trip log</h1>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <div className="space-y-3">
        {trips?.map((t) => (
          <Card key={t.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-paper-faint">
                {new Date(t.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
              </span>
              <Badge tone={STATUS_TONE[t.status] ?? "neutral"}>{t.status.replace("_", " ")}</Badge>
            </div>
            <p className="text-sm text-paper truncate">{t.pickup.address}</p>
            <p className="text-sm text-paper-dim truncate mb-2">→ {t.destinations[0]?.address}</p>
            <p className="text-sm font-medium text-paper mb-2">
              ₦{(t.fareFinal ?? t.fareEstimate).toLocaleString()}
            </p>

            {disputeId === t.id ? (
              <div className="border-t border-ink-border pt-3 mt-2">
                <input
                  type="number"
                  placeholder="Adjusted final fare (optional)"
                  className="w-full border border-ink-border-strong rounded-lg px-3 py-2 text-sm mb-2"
                  value={fareFinal}
                  onChange={(e) => setFareFinal(e.target.value)}
                />
                <TextArea
                  placeholder="Resolution notes (required)"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button onClick={() => resolveDispute(t.id)}>Save resolution</Button>
                  <Button variant="secondary" onClick={() => setDisputeId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                className="text-sm text-amber-strong font-medium"
                onClick={() => setDisputeId(t.id)}
              >
                Resolve dispute →
              </button>
            )}
          </Card>
        ))}
        {trips && trips.length === 0 && <p className="text-sm text-paper-faint">No trips yet.</p>}
      </div>
    </AppShell>
  );
}
