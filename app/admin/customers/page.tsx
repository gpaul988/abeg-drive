"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { getAdminNavLinks } from "@/lib/navLinks";

interface CustomerRow {
  userId: string;
  email: string;
  phone: string;
  verificationStatus: string;
  trustScore: number;
  flagged: boolean;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [customers, setCustomers] = useState<CustomerRow[] | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setRole(session.role);
    apiGet<{ customers: CustomerRow[] }>("/admin/customers", session.accessToken).then(({ status, data }) => {
      if (status === 200) setCustomers(data.customers);
    });
  }, [router]);

  return (
    <AppShell navLinks={getAdminNavLinks(role)} activeHref="/admin/customers" roleLabel="Admin">
      <h1 className="text-xl font-semibold text-paper mb-6">Customer directory</h1>

      <div className="space-y-3">
        {customers?.map((c) => (
          <Card key={c.userId} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-paper">{c.email}</p>
              <p className="text-sm text-paper-dim">{c.phone}</p>
            </div>
            <div className="flex items-center gap-2">
              {c.flagged && <Badge tone="danger">Flagged</Badge>}
              <Badge tone={c.verificationStatus === "verified" ? "success" : "warning"}>{c.verificationStatus}</Badge>
              <span className="text-sm text-paper-dim w-16 text-right">{c.trustScore}/100</span>
            </div>
          </Card>
        ))}
        {customers && customers.length === 0 && <p className="text-sm text-paper-faint">No customers yet.</p>}
      </div>
    </AppShell>
  );
}
