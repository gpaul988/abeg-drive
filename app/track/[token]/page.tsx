"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge, Card } from "@/components/ui";

interface PublicTracking {
  status: string;
  pickup: { address: string };
  destinations: { address: string }[];
  driver: { firstName: string; etaMinutes: number } | null;
  error?: string;
}

const STATUS_LABELS: Record<string, { label: string; tone: "success" | "warning" | "danger" | "neutral" | "info" }> = {
  requested: { label: "Finding a driver…", tone: "warning" },
  matched: { label: "Driver assigned", tone: "info" },
  en_route: { label: "Driver en route", tone: "info" },
  in_progress: { label: "Trip in progress", tone: "success" },
  completed: { label: "Trip completed", tone: "success" },
  cancelled: { label: "Trip cancelled", tone: "neutral" },
  incident: { label: "Incident reported", tone: "danger" },
};

export default function PublicTrackPage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<PublicTracking | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const res = await fetch(`/api/v1/track/${params.token}`);
      const json = await res.json();
      if (!cancelled) setData(json);
    }
    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [params.token]);

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-7 h-7 rounded-lg bg-amber flex items-center justify-center text-ink-950 text-sm font-bold">
            A
          </div>
          <span className="font-semibold text-paper">AbegDrive</span>
        </div>

        {!data && <p className="text-center text-paper-faint text-sm">Loading…</p>}

        {data?.error && (
          <Card>
            <p className="text-sm text-paper-dim text-center">This tracking link is invalid or has expired.</p>
          </Card>
        )}

        {data && !data.error && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-semibold text-paper">Shared trip</h1>
              <Badge tone={STATUS_LABELS[data.status]?.tone ?? "neutral"}>
                {STATUS_LABELS[data.status]?.label ?? data.status}
              </Badge>
            </div>
            <div className="aspect-video bg-ink-850 rounded-xl border border-dashed border-ink-border-strong flex items-center justify-center mb-4">
              <span className="text-paper-faint text-sm">Live map</span>
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
              <div className="flex items-center justify-between border-t border-ink-border pt-4 text-sm">
                <span className="text-paper capitalize">Driver: {data.driver.firstName}</span>
                <span className="text-paper-dim">ETA {data.driver.etaMinutes} min</span>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
