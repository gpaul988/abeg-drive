"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { getAdminNavLinks } from "@/lib/navLinks";

interface CorporateAccountRow {
  id: string;
  companyName: string;
  rcNumber: string;
  billingContact: string;
  employeeCount: number;
  totalTrips: number;
  totalSpend: number;
  createdAt: string;
}

export default function AdminCorporateAccountsPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [accounts, setAccounts] = useState<CorporateAccountRow[] | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setRole(session.role);
    apiGet<{ accounts: CorporateAccountRow[] }>("/admin/corporate-accounts", session.accessToken).then(
      ({ status, data }) => {
        if (status === 200) setAccounts(data.accounts);
      }
    );
  }, [router]);

  return (
    <AppShell navLinks={getAdminNavLinks(role)} activeHref="/admin/corporate-accounts" roleLabel="Admin">
      <h1 className="text-xl font-semibold text-paper mb-2">Corporate accounts</h1>
      <p className="text-sm text-paper-dim mb-6">B2B accounts on the platform, with usage and spend at a glance.</p>

      <div className="space-y-3">
        {accounts?.map((a) => (
          <Card key={a.id}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-paper">{a.companyName}</p>
              <span className="text-xs text-paper-faint font-mono">{a.rcNumber}</span>
            </div>
            <p className="text-sm text-paper-dim mb-3">{a.billingContact}</p>
            <div className="grid grid-cols-3 gap-3 text-sm border-t border-ink-border pt-3">
              <div>
                <p className="text-paper-faint text-xs">Employees</p>
                <p className="text-paper font-medium">{a.employeeCount}</p>
              </div>
              <div>
                <p className="text-paper-faint text-xs">Total trips</p>
                <p className="text-paper font-medium">{a.totalTrips}</p>
              </div>
              <div>
                <p className="text-paper-faint text-xs">Total spend</p>
                <p className="text-paper font-medium">₦{a.totalSpend.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        ))}
        {accounts && accounts.length === 0 && (
          <p className="text-sm text-paper-faint">No corporate accounts yet.</p>
        )}
      </div>
    </AppShell>
  );
}
