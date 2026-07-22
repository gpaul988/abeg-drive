"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Button, Card, ErrorBanner, SuccessBanner, TextArea } from "@/components/ui";
import { apiGet, apiPut, getSession } from "@/lib/apiClient";
import { securityNavLinks } from "@/lib/navLinks";

interface IncidentRow {
  id: string;
  type: string;
  status: string;
  triggeredBy: string;
  escalatedToSecurityPartner: boolean;
  assignedSecurityAgentId?: string;
  resolutionNotes?: string;
  createdAt: string;
  trip: {
    id: string;
    status: string;
    pickup: { address: string };
    customerPhone?: string;
    livelocationPings: { point: { lat: number; lng: number }; timestamp: string }[];
  } | null;
}

export default function SecurityIncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<IncidentRow[] | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState("");

  function load() {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setMyUserId(session.userId);
    apiGet<{ incidents: IncidentRow[] }>("/admin/incidents", session.accessToken).then(({ status, data }) => {
      if (status === 200) setIncidents(data.incidents);
    });
  }

  useEffect(load, [router]);

  async function assignSelf(id: string) {
    setError(null);
    const session = getSession()!;
    const { status } = await apiPut(`/admin/incidents/${id}`, { assignSelf: true, status: "investigating" }, session.accessToken);
    if (status !== 200) {
      setError("Couldn't assign this incident to you.");
      return;
    }
    setSuccess("Incident assigned to you.");
    load();
  }

  async function resolve(id: string) {
    setError(null);
    const notes = notesDraft[id];
    if (!notes) {
      setError("Please add resolution notes before resolving.");
      return;
    }
    const session = getSession()!;
    const { status } = await apiPut(`/admin/incidents/${id}`, { status: "resolved", resolutionNotes: notes }, session.accessToken);
    if (status !== 200) {
      setError("Couldn't resolve this incident.");
      return;
    }
    setSuccess("Incident resolved.");
    load();
  }

  const sorted = incidents
    ? [...incidents].sort((a, b) => (a.status === "resolved" ? 1 : 0) - (b.status === "resolved" ? 1 : 0))
    : [];

  return (
    <AppShell navLinks={securityNavLinks} activeHref="/security/incidents" roleLabel="Security Agent">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Incident response</h1>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <div className="space-y-4">
        {sorted.map((i) => (
          <Card key={i.id} className={i.status !== "resolved" ? "border-red-200" : ""}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900 capitalize">{i.type}</span>
                <Badge tone={i.status === "resolved" ? "success" : i.status === "investigating" ? "warning" : "danger"}>
                  {i.status}
                </Badge>
                {i.assignedSecurityAgentId === myUserId && <Badge tone="info">Assigned to you</Badge>}
              </div>
              <span className="text-xs text-neutral-400">
                {new Date(i.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>

            {i.trip && (
              <div className="text-sm text-neutral-600 mb-3 space-y-1">
                <p>Location: {i.trip.pickup.address}</p>
                {i.trip.customerPhone && (
                  <p>
                    Customer:{" "}
                    <a href={`tel:${i.trip.customerPhone}`} className="text-amber-600 font-medium">
                      {i.trip.customerPhone}
                    </a>
                  </p>
                )}
                {i.trip.livelocationPings.length > 0 && (
                  <p className="text-xs text-neutral-400">
                    Last GPS ping:{" "}
                    {new Date(i.trip.livelocationPings.at(-1)!.timestamp).toLocaleTimeString("en-NG")} at (
                    {i.trip.livelocationPings.at(-1)!.point.lat.toFixed(4)},{" "}
                    {i.trip.livelocationPings.at(-1)!.point.lng.toFixed(4)})
                  </p>
                )}
              </div>
            )}

            {i.resolutionNotes && (
              <p className="text-sm text-neutral-500 mb-3 bg-neutral-50 rounded-lg p-2">{i.resolutionNotes}</p>
            )}

            {i.status !== "resolved" && (
              <div className="border-t border-neutral-200 pt-3 space-y-2">
                {!i.assignedSecurityAgentId && (
                  <Button onClick={() => assignSelf(i.id)}>Take this incident</Button>
                )}
                <TextArea
                  placeholder="Resolution notes — what happened, actions taken"
                  rows={2}
                  value={notesDraft[i.id] ?? ""}
                  onChange={(e) => setNotesDraft({ ...notesDraft, [i.id]: e.target.value })}
                />
                <Button onClick={() => resolve(i.id)}>Mark resolved</Button>
              </div>
            )}
          </Card>
        ))}
        {incidents && incidents.length === 0 && <p className="text-sm text-neutral-400">No incidents to respond to.</p>}
      </div>
    </AppShell>
  );
}
