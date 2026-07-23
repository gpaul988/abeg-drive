"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Button, Card, ErrorBanner, SuccessBanner } from "@/components/ui";
import { apiGet, apiPut, getSession } from "@/lib/apiClient";
import { getAdminNavLinks } from "@/lib/navLinks";

interface DriverRow {
  userId: string;
  email: string;
  phone: string;
  applicationStatus: string;
  probationStatus: string;
  availability: string;
  tripsCompleted: number;
  ratingAvg: number;
}

export default function AdminDriversPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [drivers, setDrivers] = useState<DriverRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function load() {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setRole(session.role);
    apiGet<{ drivers: DriverRow[] }>("/admin/drivers", session.accessToken).then(({ status, data }) => {
      if (status === 200) setDrivers(data.drivers);
    });
  }

  useEffect(load, [router]);

  async function onSuspend(userId: string) {
    const reason = prompt("Reason for suspension:");
    if (!reason) return;
    setError(null);
    const session = getSession()!;
    const { status } = await apiPut(`/admin/drivers`, { userId, reason }, session.accessToken);
    if (status !== 200) {
      setError("Couldn't suspend this driver.");
      return;
    }
    setSuccess("Driver suspended.");
    load();
  }

  return (
    <AppShell navLinks={getAdminNavLinks(role)} activeHref="/admin/drivers" roleLabel="Admin">
      <h1 className="text-xl font-semibold text-paper mb-6">Driver directory</h1>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <div className="space-y-3">
        {drivers?.map((d) => (
          <Card key={d.userId} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-paper">{d.email}</p>
              <p className="text-sm text-paper-dim">{d.phone}</p>
              <div className="flex gap-2 mt-2">
                <Badge tone={d.applicationStatus === "approved" ? "success" : "warning"}>{d.applicationStatus}</Badge>
                <Badge tone={d.probationStatus === "graduated" ? "success" : d.probationStatus === "suspended" ? "danger" : "neutral"}>
                  {d.probationStatus.replace("_", " ")}
                </Badge>
                <Badge tone={d.availability === "online" ? "success" : "neutral"}>{d.availability}</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-paper">★ {d.ratingAvg.toFixed(1)}</p>
              <p className="text-xs text-paper-faint mb-2">{d.tripsCompleted} trips</p>
              {d.probationStatus !== "suspended" && (
                <Button variant="danger" onClick={() => onSuspend(d.userId)}>
                  Suspend
                </Button>
              )}
            </div>
          </Card>
        ))}
        {drivers && drivers.length === 0 && <p className="text-sm text-paper-faint">No drivers yet.</p>}
      </div>
    </AppShell>
  );
}
