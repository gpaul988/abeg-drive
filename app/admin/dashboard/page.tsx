"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { getAdminNavLinks } from "@/lib/navLinks";

interface Trip {
  id: string;
  status: string;
}
interface Driver {
  applicationStatus: string;
  availability: string;
}
interface Incident {
  id: string;
  status: string;
  type: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setRole(session.role);
    apiGet<{ trips: Trip[] }>("/admin/trips", session.accessToken).then(({ status, data }) => {
      if (status === 200) setTrips(data.trips);
    });
    apiGet<{ drivers: Driver[] }>("/admin/drivers", session.accessToken).then(({ status, data }) => {
      if (status === 200) setDrivers(data.drivers);
    });
    apiGet<{ incidents: Incident[] }>("/admin/incidents", session.accessToken).then(({ status, data }) => {
      if (status === 200) setIncidents(data.incidents);
    });
  }, [router]);

  const activeTrips = trips.filter((t) => ["requested", "matched", "en_route", "in_progress"].includes(t.status));
  const onlineDrivers = drivers.filter((d) => d.availability === "online");
  const openIncidents = incidents.filter((i) => i.status !== "resolved");

  return (
    <AppShell navLinks={getAdminNavLinks(role)} activeHref="/admin/dashboard" roleLabel={roleLabel(role)}>
      <h1 className="text-xl font-semibold text-paper mb-6">Operations overview</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-sm text-paper-dim mb-1">Active trips</p>
          <p className="text-2xl font-semibold text-paper">{activeTrips.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-paper-dim mb-1">Drivers online</p>
          <p className="text-2xl font-semibold text-paper">{onlineDrivers.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-paper-dim mb-1">Open incidents</p>
          <p className={`text-2xl font-semibold ${openIncidents.length > 0 ? "text-danger" : "text-paper"}`}>
            {openIncidents.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-paper-dim mb-1">Total drivers</p>
          <p className="text-2xl font-semibold text-paper">{drivers.length}</p>
        </Card>
      </div>

      <div className="aspect-[21/9] bg-ink-850 rounded-xl border border-dashed border-ink-border-strong flex items-center justify-center mb-8">
        <span className="text-paper-faint text-sm">
          Live trip map — requires Google Maps Platform key in production
        </span>
      </div>

      <h2 className="font-medium text-paper mb-3">Recent incidents</h2>
      <div className="space-y-3">
        {incidents.slice(0, 5).map((i) => (
          <Card key={i.id} className="flex items-center justify-between">
            <span className="text-sm text-paper capitalize">{i.type}</span>
            <Badge tone={i.status === "resolved" ? "success" : "danger"}>{i.status}</Badge>
          </Card>
        ))}
        {incidents.length === 0 && <p className="text-sm text-paper-faint">No incidents reported.</p>}
      </div>
    </AppShell>
  );
}

function roleLabel(role: string): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "platform_admin":
      return "Platform Admin";
    default:
      return "Admin";
  }
}
