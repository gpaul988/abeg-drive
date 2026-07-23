"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Button, Card, SuccessBanner } from "@/components/ui";
import { apiGet, apiPost, getSession } from "@/lib/apiClient";
import { driverNavLinks } from "@/lib/navLinks";

const MODULES = [
  { id: "safety-basics", title: "Safety fundamentals", description: "Two-driver protocol, panic button, and incident reporting." },
  { id: "customer-handling", title: "Customer handling", description: "De-escalation, professionalism, and communication standards." },
  { id: "vehicle-handling", title: "Handling a customer's vehicle", description: "Care standards, fuel policy, and damage reporting." },
  { id: "emergency-response", title: "Emergency response", description: "What to do in an accident, medical emergency, or security incident." },
];

export default function DriverTrainingPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  function load() {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<{ profile: { trainingModulesCompleted: string[] } }>("/drivers/me", session.accessToken).then(
      ({ status, data }) => {
        if (status === 200) setCompleted(data.profile.trainingModulesCompleted);
      }
    );
  }

  useEffect(load, [router]);

  async function markComplete(moduleId: string) {
    const session = getSession()!;
    const { status } = await apiPost("/drivers/me/training", { moduleId }, session.accessToken);
    if (status === 200) {
      setCompleted((prev) => [...prev, moduleId]);
      setSuccess("Module marked complete.");
    }
  }

  return (
    <AppShell navLinks={driverNavLinks} activeHref="/driver/training" roleLabel="Driver">
      <h1 className="text-xl font-semibold text-paper mb-2">Training</h1>
      <p className="text-sm text-paper-dim mb-6">
        Complete every module before your first trip. Full video-based training is planned for a future release —
        this checklist is the MVP standard.
      </p>

      <SuccessBanner message={success} />

      <div className="space-y-3">
        {MODULES.map((m) => {
          const done = completed.includes(m.id);
          return (
            <Card key={m.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-paper">{m.title}</p>
                <p className="text-sm text-paper-dim">{m.description}</p>
              </div>
              {done ? (
                <span className="text-success text-sm font-medium">✓ Complete</span>
              ) : (
                <Button onClick={() => markComplete(m.id)}>Mark complete</Button>
              )}
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
