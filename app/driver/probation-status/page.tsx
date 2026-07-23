"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { driverNavLinks } from "@/lib/navLinks";

interface ProbationStatus {
  probationStatus: string;
  tripsCompleted: number;
  probationTripsRequired: number;
  progressPct: number;
}

export default function ProbationStatusPage() {
  const router = useRouter();
  const [data, setData] = useState<ProbationStatus | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<ProbationStatus>("/drivers/me/probation-status", session.accessToken).then(({ status, data }) => {
      if (status === 404) {
        setNotFound(true);
        return;
      }
      setData(data);
    });
  }, [router]);

  return (
    <AppShell navLinks={driverNavLinks} activeHref="/driver/probation-status" roleLabel="Driver">
      <h1 className="text-xl font-semibold text-paper mb-6">Application & probation status</h1>

      {notFound && (
        <Card>
          <p className="text-sm text-paper-dim">
            You haven&apos;t started a driver application yet.{" "}
            <a href="/driver/onboarding" className="text-amber-strong font-medium">
              Start now →
            </a>
          </p>
        </Card>
      )}

      {data && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium text-paper">Probation status</p>
            <Badge tone={data.probationStatus === "graduated" ? "success" : "warning"}>
              {data.probationStatus.replace("_", " ")}
            </Badge>
          </div>
          <div className="w-full bg-ink-850 rounded-full h-2 mb-2">
            <div className="bg-amber h-2 rounded-full" style={{ width: `${data.progressPct}%` }} />
          </div>
          <p className="text-sm text-paper-dim">
            {data.tripsCompleted} of {data.probationTripsRequired} ops-monitored trips completed
          </p>
        </Card>
      )}
    </AppShell>
  );
}
