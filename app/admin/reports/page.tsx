"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { getAdminNavLinks } from "@/lib/navLinks";

interface ComplianceReport {
  generatedAt: string;
  totalDrivers: number;
  approvedDrivers: number;
  driversInProbation: number;
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalIncidents: number;
  incidentsByType: { panic: number; accident: number; dispute: number; no_show: number };
  incidentsResolved: number;
  incidentsEscalatedToSecurityPartner: number;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [report, setReport] = useState<ComplianceReport | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setRole(session.role);
    apiGet<{ report: ComplianceReport }>("/admin/reports/compliance-export", session.accessToken).then(
      ({ status, data }) => {
        if (status === 200) setReport(data.report);
      }
    );
  }, [router]);

  return (
    <AppShell navLinks={getAdminNavLinks(role)} activeHref="/admin/reports" roleLabel="Admin">
      <h1 className="text-xl font-semibold text-paper mb-2">Compliance report</h1>
      <p className="text-sm text-paper-dim mb-6">
        Designed to hand to the Rivers State Ministry of Transportation or FRSC as a road-safety partner —
        excludes NIN/BVN and any raw PII.
      </p>

      {!report && <p className="text-sm text-paper-faint">Loading…</p>}

      {report && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-paper-dim mb-1">Total drivers</p>
            <p className="text-2xl font-semibold text-paper">{report.totalDrivers}</p>
          </Card>
          <Card>
            <p className="text-sm text-paper-dim mb-1">Approved drivers</p>
            <p className="text-2xl font-semibold text-paper">{report.approvedDrivers}</p>
          </Card>
          <Card>
            <p className="text-sm text-paper-dim mb-1">Drivers in probation</p>
            <p className="text-2xl font-semibold text-paper">{report.driversInProbation}</p>
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
            <p className="text-sm text-paper-dim mb-1">Total incidents</p>
            <p className="text-2xl font-semibold text-paper">{report.totalIncidents}</p>
          </Card>
          <Card>
            <p className="text-sm text-paper-dim mb-1">Incidents resolved</p>
            <p className="text-2xl font-semibold text-paper">{report.incidentsResolved}</p>
          </Card>
          <Card>
            <p className="text-sm text-paper-dim mb-1">Escalated to security partner</p>
            <p className="text-2xl font-semibold text-paper">{report.incidentsEscalatedToSecurityPartner}</p>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-3">
            <p className="text-sm text-paper-dim mb-2">Incidents by type</p>
            <div className="flex gap-6 text-sm">
              <span>Panic: {report.incidentsByType.panic}</span>
              <span>Accident: {report.incidentsByType.accident}</span>
              <span>Dispute: {report.incidentsByType.dispute}</span>
              <span>No-show: {report.incidentsByType.no_show}</span>
            </div>
          </Card>
          <p className="text-xs text-paper-faint sm:col-span-2 lg:col-span-3">
            Generated {new Date(report.generatedAt).toLocaleString("en-NG")}
          </p>
        </div>
      )}
    </AppShell>
  );
}
