"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Button, Card } from "@/components/ui";
import { apiGet, apiPut, getSession } from "@/lib/apiClient";
import { getAdminNavLinks } from "@/lib/navLinks";

interface Venue {
  id: string;
  venueName: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  whitelisted: boolean;
  createdAt: string;
}

export default function AdminVenuesPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [venues, setVenues] = useState<Venue[] | null>(null);

  function load() {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setRole(session.role);
    apiGet<{ venues: Venue[] }>("/admin/venues", session.accessToken).then(({ status, data }) => {
      if (status === 200) setVenues(data.venues);
    });
  }

  useEffect(load, [router]);

  async function toggleWhitelist(venue: Venue) {
    const session = getSession()!;
    await apiPut("/admin/venues", { venueId: venue.id, whitelisted: !venue.whitelisted }, session.accessToken);
    load();
  }

  return (
    <AppShell navLinks={getAdminNavLinks(role)} activeHref="/admin/venues" roleLabel="Admin">
      <h1 className="text-xl font-semibold text-paper mb-2">Venue partners</h1>
      <p className="text-sm text-paper-dim mb-6">
        Phase 1 launch strategy: only whitelisted venues can request drivers on behalf of guests.
      </p>

      <div className="space-y-3">
        {venues?.map((v) => (
          <Card key={v.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-paper">{v.venueName}</p>
              <p className="text-sm text-paper-dim">{v.address}</p>
              <p className="text-xs text-paper-faint">
                {v.contactPerson} · {v.contactPhone}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={v.whitelisted ? "success" : "neutral"}>
                {v.whitelisted ? "Whitelisted" : "Not whitelisted"}
              </Badge>
              <Button variant={v.whitelisted ? "danger" : "primary"} onClick={() => toggleWhitelist(v)}>
                {v.whitelisted ? "Remove" : "Whitelist"}
              </Button>
            </div>
          </Card>
        ))}
        {venues && venues.length === 0 && <p className="text-sm text-paper-faint">No venue partners yet.</p>}
      </div>
    </AppShell>
  );
}
