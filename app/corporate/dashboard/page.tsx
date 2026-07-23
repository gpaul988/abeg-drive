"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { corporateNavLinks } from "@/lib/navLinks";

interface CorporateAccount {
  id: string;
  companyName: string;
  employeeUserIds: string[];
}

export default function CorporateDashboardPage() {
  const router = useRouter();
  const [account, setAccount] = useState<CorporateAccount | null>(null);
  const [tripStats, setTripStats] = useState<{ totalTrips: number; totalSpend: number } | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<{ account: CorporateAccount }>("/corporate/me", session.accessToken).then(async ({ status, data }) => {
      if (status !== 200) return;
      setAccount(data.account);
      const billing = await apiGet<{ totalTrips: number; totalSpend: number }>(
        `/corporate/${data.account.id}/billing`,
        session.accessToken
      );
      if (billing.status === 200) setTripStats(billing.data);
    });
  }, [router]);

  if (!account) {
    return (
      <AppShell navLinks={corporateNavLinks} activeHref="/corporate/dashboard" roleLabel="Corporate Admin">
        <p className="text-neutral-400 text-sm">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell navLinks={corporateNavLinks} activeHref="/corporate/dashboard" roleLabel="Corporate Admin">
      <h1 className="text-xl font-semibold text-neutral-900 mb-1">{account.companyName}</h1>
      <p className="text-neutral-500 mb-6">Corporate account overview</p>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-neutral-500 mb-1">Employees</p>
          <p className="text-2xl font-semibold text-neutral-900">{account.employeeUserIds.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500 mb-1">Total trips</p>
          <p className="text-2xl font-semibold text-neutral-900">{tripStats?.totalTrips ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500 mb-1">Total spend</p>
          <p className="text-2xl font-semibold text-neutral-900">₦{(tripStats?.totalSpend ?? 0).toLocaleString()}</p>
        </Card>
      </div>
    </AppShell>
  );
}
