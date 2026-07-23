"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { driverNavLinks } from "@/lib/navLinks";

interface Trip {
  id: string;
  status: string;
  fareFinal?: number;
  fareEstimate: number;
  completedAt?: string;
}

export default function DriverEarningsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[] | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<{ trips: Trip[] }>("/trips", session.accessToken).then(({ status, data }) => {
      if (status === 200) setTrips(data.trips.filter((t) => t.status === "completed"));
    });
  }, [router]);

  const total = trips?.reduce((sum, t) => sum + (t.fareFinal ?? t.fareEstimate), 0) ?? 0;

  return (
    <AppShell navLinks={driverNavLinks} activeHref="/driver/earnings" roleLabel="Driver">
      <h1 className="text-xl font-semibold text-paper mb-6">Earnings</h1>

      <Card className="mb-6">
        <p className="text-sm text-paper-dim mb-1">Total earned (all time)</p>
        <p className="text-3xl font-semibold text-paper">₦{total.toLocaleString()}</p>
        <p className="text-xs text-paper-faint mt-2">
          Payouts settle to your linked bank account via Paystack subaccount transfer — production only, not
          simulated in this dev build.
        </p>
      </Card>

      <h2 className="font-medium text-paper mb-3">Completed trips</h2>
      {!trips && <p className="text-sm text-paper-faint">Loading…</p>}
      {trips && trips.length === 0 && <p className="text-sm text-paper-faint">No completed trips yet.</p>}
      <div className="space-y-3">
        {trips?.map((t) => (
          <Card key={t.id} className="flex items-center justify-between">
            <span className="text-sm text-paper-dim">
              {t.completedAt && new Date(t.completedAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
            </span>
            <span className="font-medium text-paper">₦{(t.fareFinal ?? t.fareEstimate).toLocaleString()}</span>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
