"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { corporateNavLinks } from "@/lib/navLinks";

interface Billing {
  companyName: string;
  billingContact: string;
  totalTrips: number;
  totalSpend: number;
  trips: { id: string; fare: number; completedAt?: string }[];
}

export default function CorporateBillingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<Billing | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<{ account: { id: string } }>("/corporate/me", session.accessToken).then(async ({ status, data }) => {
      if (status !== 200) return;
      const res = await apiGet<Billing>(`/corporate/${data.account.id}/billing`, session.accessToken);
      if (res.status === 200) setBilling(res.data);
    });
  }, [router]);

  return (
    <AppShell navLinks={corporateNavLinks} activeHref="/corporate/billing" roleLabel="Corporate Admin">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Billing</h1>

      {!billing && <p className="text-sm text-neutral-400">Loading…</p>}

      {billing && (
        <>
          <Card className="mb-6">
            <p className="text-sm text-neutral-500 mb-1">Billing contact</p>
            <p className="font-medium text-neutral-900 mb-4">{billing.billingContact}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">Total trips</p>
                <p className="text-xl font-semibold text-neutral-900">{billing.totalTrips}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Total spend</p>
                <p className="text-xl font-semibold text-neutral-900">₦{billing.totalSpend.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <h2 className="font-medium text-neutral-900 mb-3">Trip charges</h2>
          <div className="space-y-2">
            {billing.trips.map((t) => (
              <Card key={t.id} className="flex items-center justify-between py-3">
                <span className="text-xs text-neutral-400">
                  {t.completedAt && new Date(t.completedAt).toLocaleDateString("en-NG")}
                </span>
                <span className="font-medium text-neutral-900">₦{t.fare.toLocaleString()}</span>
              </Card>
            ))}
            {billing.trips.length === 0 && <p className="text-sm text-neutral-400">No completed trips yet.</p>}
          </div>
        </>
      )}
    </AppShell>
  );
}
