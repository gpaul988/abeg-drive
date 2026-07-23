"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell, Badge, Button, Card, ErrorBanner, SuccessBanner } from "@/components/ui";
import { apiGet, apiPost, getSession } from "@/lib/apiClient";
import { customerNavLinks } from "@/lib/navLinks";

interface TrackingData {
  status: string;
  pickup: { label: string; address: string };
  destinations: { label: string; address: string }[];
  driver: { name: string; ratingAvg: number; etaMinutes: number } | null;
  shareTripLinkToken?: string;
}

const STATUS_LABELS: Record<string, { label: string; tone: "success" | "warning" | "danger" | "neutral" | "info" }> = {
  requested: { label: "Finding your driver…", tone: "warning" },
  matched: { label: "Driver assigned", tone: "info" },
  en_route: { label: "Driver en route to you", tone: "info" },
  in_progress: { label: "Trip in progress", tone: "success" },
  completed: { label: "Trip completed", tone: "success" },
  cancelled: { label: "Trip cancelled", tone: "neutral" },
  incident: { label: "Incident reported", tone: "danger" },
};

export default function TrackingPage() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const [data, setData] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [panicLoading, setPanicLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const fetchTracking = useCallback(async () => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    const { status, data } = await apiGet<TrackingData>(`/trips/${params.tripId}/tracking`, session.accessToken);
    if (status === 200) setData(data);
  }, [params.tripId, router]);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 5000);
    return () => clearInterval(interval);
  }, [fetchTracking]);

  async function onPanic() {
    if (!confirm("This will alert our security response team immediately. Continue?")) return;
    setPanicLoading(true);
    setError(null);
    const session = getSession()!;
    const { status } = await apiPost(`/trips/${params.tripId}/panic`, { triggeredBy: "customer" }, session.accessToken);
    setPanicLoading(false);
    if (status !== 201) {
      setError("Couldn't send the alert — please call our emergency hotline directly.");
      return;
    }
    setSuccess("Alert sent. Security response is being dispatched to your location.");
    fetchTracking();
  }

  async function onShare() {
    const session = getSession()!;
    const { status, data } = await apiPost<{ url: string }>(`/trips/${params.tripId}/share-link`, {}, session.accessToken);
    if (status === 200) {
      setShareUrl(`${window.location.origin}${data.url}`);
    }
  }

  if (!data) {
    return (
      <AppShell navLinks={customerNavLinks} activeHref="/book" roleLabel="Customer">
        <p className="text-paper-faint text-sm">Loading trip…</p>
      </AppShell>
    );
  }

  const statusInfo = STATUS_LABELS[data.status] ?? { label: data.status, tone: "neutral" as const };

  return (
    <AppShell navLinks={customerNavLinks} activeHref="/book" roleLabel="Customer">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-paper">Your trip</h1>
          <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
        </div>

        <ErrorBanner message={error} />
        <SuccessBanner message={success} />

        <Card className="mb-4">
          <div className="aspect-video bg-ink-850 rounded-xl border border-dashed border-ink-border-strong flex items-center justify-center mb-4">
            <span className="text-paper-faint text-sm">
              Live map — requires Google Maps Platform key in production
            </span>
          </div>

          <div className="space-y-2 text-sm mb-4">
            <div className="flex gap-2">
              <span className="w-2 h-2 mt-1.5 rounded-full bg-paper shrink-0" />
              <span className="text-paper-dim">{data.pickup.address}</span>
            </div>
            {data.destinations.map((d, i) => (
              <div key={i} className="flex gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-amber shrink-0" />
                <span className="text-paper-dim">{d.address}</span>
              </div>
            ))}
          </div>

          {data.driver && (
            <div className="flex items-center justify-between border-t border-ink-border pt-4">
              <div>
                <p className="font-medium text-paper capitalize">{data.driver.name}</p>
                <p className="text-xs text-paper-dim">★ {data.driver.ratingAvg.toFixed(1)}</p>
              </div>
              <p className="text-sm text-paper-dim">ETA {data.driver.etaMinutes} min</p>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button variant="secondary" onClick={onShare}>
            Share trip
          </Button>
          <Button variant="danger" loading={panicLoading} onClick={onPanic}>
            🚨 Panic button
          </Button>
        </div>

        {shareUrl && (
          <Card className="mb-4">
            <p className="text-xs text-paper-dim mb-1">Share this link — no login required to view:</p>
            <code className="text-xs break-all text-paper-dim">{shareUrl}</code>
          </Card>
        )}

        {data.status === "completed" && (
          <Button
            className="w-full"
            onClick={() => router.push(`/trip/${params.tripId}/receipt`)}
          >
            View receipt
          </Button>
        )}
      </div>
    </AppShell>
  );
}
