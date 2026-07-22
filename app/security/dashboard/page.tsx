"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { securityNavLinks } from "@/lib/navLinks";

interface IncidentRow {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  trip: { id: string; status: string; pickup: { address: string } } | null;
}

export default function SecurityDashboardPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);

  function load() {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    apiGet<{ incidents: IncidentRow[] }>("/admin/incidents", session.accessToken).then(({ status, data }) => {
      if (status === 200) setIncidents(data.incidents);
    });
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const openIncidents = incidents.filter((i) => i.status !== "resolved");

  return (
    <AppShell navLinks={securityNavLinks} activeHref="/security/dashboard" roleLabel="Security Agent">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Live safety response</h1>
        {openIncidents.length > 0 && (
          <Badge tone="danger">{openIncidents.length} open incident{openIncidents.length > 1 ? "s" : ""}</Badge>
        )}
      </div>

      <div className="aspect-[21/9] bg-neutral-100 rounded-xl border border-dashed border-neutral-300 flex items-center justify-center mb-8">
        <span className="text-neutral-400 text-sm">
          Live trip map with incident pins — requires Google Maps Platform key in production
        </span>
      </div>

      <h2 className="font-medium text-neutral-900 mb-3">Active alerts</h2>
      {openIncidents.length === 0 && (
        <Card>
          <p className="text-sm text-neutral-500">No active alerts. All clear.</p>
        </Card>
      )}
      <div className="space-y-3">
        {openIncidents.map((i) => (
          <a key={i.id} href="/security/incidents">
            <Card className="border-red-200 hover:border-red-300">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-neutral-900 capitalize">{i.type}</span>
                <Badge tone="danger">{i.status}</Badge>
              </div>
              {i.trip && <p className="text-sm text-neutral-600">{i.trip.pickup.address}</p>}
              <p className="text-xs text-neutral-400 mt-1">
                {new Date(i.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </Card>
          </a>
        ))}
      </div>
    </AppShell>
  );
}
