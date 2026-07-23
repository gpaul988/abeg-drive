"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Button, Card, ErrorBanner, SuccessBanner, TextArea } from "@/components/ui";
import { apiGet, apiPut, getSession } from "@/lib/apiClient";
import { getAdminNavLinks } from "@/lib/navLinks";

interface IncidentRow {
  id: string;
  type: string;
  status: string;
  triggeredBy: string;
  escalatedToSecurityPartner: boolean;
  resolutionNotes?: string;
  createdAt: string;
  trip: { id: string; status: string; pickup: { address: string }; customerPhone?: string } | null;
}

export default function AdminIncidentsPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [incidents, setIncidents] = useState<IncidentRow[] | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function load() {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setRole(session.role);
    apiGet<{ incidents: IncidentRow[] }>("/admin/incidents", session.accessToken).then(({ status, data }) => {
      if (status === 200) setIncidents(data.incidents);
    });
  }

  useEffect(load, [router]);

  async function updateStatus(id: string, status: "investigating" | "resolved") {
    setError(null);
    const session = getSession()!;
    const body: Record<string, unknown> = { status };
    if (status === "resolved") {
      const notes = notesDraft[id];
      if (!notes) {
        setError("Please add resolution notes before marking resolved.");
        return;
      }
      body.resolutionNotes = notes;
    }
    const { status: httpStatus } = await apiPut(`/admin/incidents/${id}`, body, session.accessToken);
    if (httpStatus !== 200) {
      setError("Couldn't update this incident.");
      return;
    }
    setSuccess(`Incident marked ${status}.`);
    load();
  }

  return (
    <AppShell navLinks={getAdminNavLinks(role)} activeHref="/admin/incidents" roleLabel="Admin">
      <h1 className="text-xl font-semibold text-paper mb-6">Incidents</h1>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <div className="space-y-4">
        {incidents?.map((i) => (
          <Card key={i.id} className={i.status !== "resolved" ? "border-danger/30" : ""}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-paper capitalize">{i.type}</span>
                <Badge tone={i.status === "resolved" ? "success" : i.status === "investigating" ? "warning" : "danger"}>
                  {i.status}
                </Badge>
                {i.escalatedToSecurityPartner && <Badge tone="danger">Escalated</Badge>}
              </div>
              <span className="text-xs text-paper-faint">
                {new Date(i.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>

            <div className="text-sm text-paper-dim mb-3">
              <p>Triggered by: {i.triggeredBy}</p>
              {i.trip && (
                <>
                  <p>Trip status: {i.trip.status}</p>
                  <p>Location: {i.trip.pickup.address}</p>
                  {i.trip.customerPhone && <p>Customer: {i.trip.customerPhone}</p>}
                </>
              )}
            </div>

            {i.resolutionNotes && (
              <p className="text-sm text-paper-dim mb-3 bg-ink-950 rounded-lg p-2">{i.resolutionNotes}</p>
            )}

            {i.status !== "resolved" && (
              <div className="border-t border-ink-border pt-3">
                {i.status === "open" && (
                  <Button className="mb-2" onClick={() => updateStatus(i.id, "investigating")}>
                    Start investigating
                  </Button>
                )}
                <TextArea
                  placeholder="Resolution notes"
                  rows={2}
                  className="mb-2"
                  value={notesDraft[i.id] ?? ""}
                  onChange={(e) => setNotesDraft({ ...notesDraft, [i.id]: e.target.value })}
                />
                <Button onClick={() => updateStatus(i.id, "resolved")}>Mark resolved</Button>
              </div>
            )}
          </Card>
        ))}
        {incidents && incidents.length === 0 && <p className="text-sm text-paper-faint">No incidents reported.</p>}
      </div>
    </AppShell>
  );
}
