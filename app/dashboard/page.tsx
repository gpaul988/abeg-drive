"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Button, Card } from "@/components/ui";
import { apiGet, clearSession, getSession } from "@/lib/apiClient";
import { customerNavLinks } from "@/lib/navLinks";

interface Me {
  id: string;
  phone: string;
  email: string;
  role: string;
  verificationStatus: string;
  onboardingComplete: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role === "driver") {
      router.replace("/driver/dashboard");
      return;
    }
    apiGet<Me>("/customers/me", session.accessToken).then(({ status, data }) => {
      if (status !== 200) {
        clearSession();
        router.replace("/login");
        return;
      }
      setMe(data);
    });
  }, [router]);

  if (!me) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-400 text-sm">Loading…</div>
    );
  }

  return (
    <AppShell navLinks={customerNavLinks} activeHref="/dashboard" roleLabel="Customer">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-1">
        Welcome{me.email ? `, ${me.email.split("@")[0]}` : ""}
      </h1>
      <p className="text-neutral-500 mb-8">Ready when you are.</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <p className="text-sm text-neutral-500 mb-1">Verification status</p>
          <Badge tone={me.verificationStatus === "verified" ? "success" : "warning"}>
            {me.verificationStatus}
          </Badge>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500 mb-1">Onboarding</p>
          <p className="font-medium text-neutral-900">
            {me.onboardingComplete ? "Complete — you can book a driver" : "Incomplete"}
          </p>
        </Card>
      </div>

      <Card className="text-center py-10">
        <p className="text-neutral-500 mb-4">Need a safe ride home?</p>
        <Button onClick={() => router.push("/book")} disabled={!me.onboardingComplete}>
          Book a driver
        </Button>
        {!me.onboardingComplete && (
          <p className="text-xs text-neutral-400 mt-3">
            Complete identity verification and add a payment method to unlock booking.
          </p>
        )}
      </Card>
    </AppShell>
  );
}
