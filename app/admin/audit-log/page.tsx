"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { getAdminNavLinks } from "@/lib/navLinks";

interface AuditEntry {
  id: string;
  actorUserId: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  createdAt: string;
}

export default function AdminAuditLogPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setRole(session.role);
    apiGet<{ entries: AuditEntry[] }>("/admin/audit-log", session.accessToken).then(({ status, data }) => {
      if (status === 403) {
        setForbidden(true);
        return;
      }
      if (status === 200) setEntries(data.entries);
    });
  }, [router]);

  return (
    <AppShell navLinks={getAdminNavLinks(role)} activeHref="/admin/audit-log" roleLabel="Admin">
      <h1 className="text-xl font-semibold text-neutral-900 mb-2">Audit log</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Immutable record of every administrative action — visible to Super Admin only.
      </p>

      {forbidden && (
        <Card>
          <p className="text-sm text-neutral-500">You don&apos;t have permission to view the audit log.</p>
        </Card>
      )}

      <div className="space-y-2">
        {entries?.map((e) => (
          <Card key={e.id} className="text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-neutral-900">{e.action.replace(/_/g, " ")}</span>
              <span className="text-xs text-neutral-400">{new Date(e.createdAt).toLocaleString("en-NG")}</span>
            </div>
            <p className="text-neutral-500">
              {e.actorRole} ({e.actorUserId.slice(0, 8)}…) → {e.targetType} {e.targetId.slice(0, 8)}…
            </p>
            {e.details && <p className="text-neutral-400 text-xs mt-1">{e.details}</p>}
          </Card>
        ))}
        {entries && entries.length === 0 && <p className="text-sm text-neutral-400">No actions logged yet.</p>}
      </div>
    </AppShell>
  );
}
