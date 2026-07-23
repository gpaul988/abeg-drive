"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { corporateNavLinks } from "@/lib/navLinks";

interface Report {
  companyName: string;
  generatedAt: string;
  totalEmployees: number;
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  incidentsInvolvingEmployees: number;
  averageFare: number;
}

export default function CorporateReportsPage() {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<{ account: { id: string } }>("/corporate/me", session.accessToken).then(async ({ status, data }) => {
      if (status !== 200) return;
      const res = await apiGet<Report>(`/corporate/${data.account.id}/reports`, session.accessToken);
      if (res.status === 200) setReport(res.data);
    });
  }, [router]);

  return (
    <AppShell navLinks={corporateNavLinks} activeHref="/corporate/reports" roleLabel="Corporate Admin">
      <h1 className="text-xl font-semibold text-paper mb-2">Safety & usage report</h1>
      <p className="text-sm text-paper-dim mb-6">
        Share this with your organization&apos;s safety policy compliance team.
      </p>

      {!report && <p className="text-sm text-paper-faint">Loading…</p>}

      {report && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-paper-dim mb-1">Employees using AbegDrive</p>
            <p className="text-2xl font-semibold text-paper">{report.totalEmployees}</p>
          </Card>
          <Card>
            <p className="text-sm text-paper-dim mb-1">Total trips</p>
            <p className="text-2xl font-semibold text-paper">{report.totalTrips}</p>
          </Card>
          <Card>
            <p className="text-sm text-paper-dim mb-1">Completed trips</p>
            <p className="text-2xl font-semibold text-paper">{report.completedTrips}</p>
          </Card>
          <Card>
            <p className="text-sm text-paper-dim mb-1">Cancelled trips</p>
            <p className="text-2xl font-semibold text-paper">{report.cancelledTrips}</p>
          </Card>
          <Card>
            <p className="text-sm text-paper-dim mb-1">Incidents involving employees</p>
            <p className="text-2xl font-semibold text-paper">{report.incidentsInvolvingEmployees}</p>
          </Card>
          <Card>
            <p className="text-sm text-paper-dim mb-1">Average fare</p>
            <p className="text-2xl font-semibold text-paper">₦{report.averageFare.toLocaleString()}</p>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
