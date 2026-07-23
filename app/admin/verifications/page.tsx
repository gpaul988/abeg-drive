"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Button, Card, ErrorBanner, SuccessBanner } from "@/components/ui";
import { apiGet, apiPost, getSession } from "@/lib/apiClient";
import { getAdminNavLinks } from "@/lib/navLinks";

interface QueueItem {
  userId: string;
  email: string;
  phone: string;
  ninOnFile: boolean;
  bvnOnFile: boolean;
  licenseNumber?: string;
  licenseExpiry?: string;
  guarantor?: { name: string; phone: string; relationship: string };
  vehicleCompetency: string[];
  backgroundCheckStatus: string;
  submittedAt: string;
}

export default function VerificationsQueuePage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  function load() {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setRole(session.role);
    apiGet<{ queue: QueueItem[] }>("/admin/verifications/queue", session.accessToken).then(({ status, data }) => {
      if (status === 200) setQueue(data.queue);
    });
  }

  useEffect(load, [router]);

  async function onApprove(userId: string) {
    setError(null);
    const session = getSession()!;
    const { status } = await apiPost(`/admin/verifications/${userId}/approve`, {}, session.accessToken);
    if (status !== 200) {
      setError("Couldn't approve this application.");
      return;
    }
    setSuccess("Driver approved — they can now go online.");
    load();
  }

  async function onReject(userId: string) {
    setError(null);
    if (!rejectReason) {
      setError("Please provide a reason for rejection.");
      return;
    }
    const session = getSession()!;
    const { status } = await apiPost(`/admin/verifications/${userId}/reject`, { reason: rejectReason }, session.accessToken);
    if (status !== 200) {
      setError("Couldn't reject this application.");
      return;
    }
    setSuccess("Application rejected.");
    setRejectingId(null);
    setRejectReason("");
    load();
  }

  return (
    <AppShell navLinks={getAdminNavLinks(role)} activeHref="/admin/verifications" roleLabel="Admin">
      <h1 className="text-xl font-semibold text-paper mb-2">Verification queue</h1>
      <p className="text-sm text-paper-dim mb-6">
        Driver applications awaiting manual review. No FRSC database integration in this MVP — every application
        requires a human decision.
      </p>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {queue && queue.length === 0 && <p className="text-sm text-paper-faint">Queue is empty.</p>}

      <div className="space-y-4">
        {queue?.map((item) => (
          <Card key={item.userId}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-paper">{item.email}</p>
                <p className="text-sm text-paper-dim">{item.phone}</p>
              </div>
              <Badge tone={item.ninOnFile && item.bvnOnFile ? "success" : "warning"}>
                {item.ninOnFile && item.bvnOnFile ? "NIN + BVN verified" : "Missing identity docs"}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <p className="text-paper-dim">License</p>
                <p className="text-paper">{item.licenseNumber ?? "—"}</p>
                <p className="text-xs text-paper-faint">
                  Expires {item.licenseExpiry ? new Date(item.licenseExpiry).toLocaleDateString("en-NG") : "—"}
                </p>
              </div>
              <div>
                <p className="text-paper-dim">Guarantor</p>
                <p className="text-paper">{item.guarantor?.name ?? "—"}</p>
                <p className="text-xs text-paper-faint">
                  {item.guarantor?.phone} · {item.guarantor?.relationship}
                </p>
              </div>
              <div>
                <p className="text-paper-dim">Vehicle competency</p>
                <p className="text-paper capitalize">{item.vehicleCompetency.join(", ")}</p>
              </div>
              <div>
                <p className="text-paper-dim">Submitted</p>
                <p className="text-paper">{new Date(item.submittedAt).toLocaleDateString("en-NG")}</p>
              </div>
            </div>

            {rejectingId === item.userId ? (
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-ink-border-strong rounded-lg px-3 py-2 text-sm"
                  placeholder="Reason for rejection"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <Button variant="danger" onClick={() => onReject(item.userId)}>
                  Confirm reject
                </Button>
                <Button variant="secondary" onClick={() => setRejectingId(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => onApprove(item.userId)}>Approve</Button>
                <Button variant="danger" onClick={() => setRejectingId(item.userId)}>
                  Reject
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
