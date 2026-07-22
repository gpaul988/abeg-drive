"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell, Button, Card, ErrorBanner } from "@/components/ui";
import { apiPost, getSession } from "@/lib/apiClient";
import { driverNavLinks } from "@/lib/navLinks";

export default function StartVerificationPage() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCapture() {
    setError(null);
    setLoading(true);
    const session = getSession()!;
    const { status, data } = await apiPost<{ match: boolean; error?: string }>(
      `/drivers/me/trips/${params.tripId}/start-selfie-verify`,
      { selfieImageBase64: "dev-placeholder-selfie-data" },
      session.accessToken
    );
    setLoading(false);
    if (status !== 200 || !data.match) {
      setError("Liveness check failed — this confirms the correct driver is starting the trip. Please try again.");
      return;
    }
    router.push(`/driver/trip/${params.tripId}`);
  }

  return (
    <AppShell navLinks={driverNavLinks} activeHref="/driver/dashboard" roleLabel="Driver">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Confirm it&apos;s you</h1>
        <p className="text-sm text-neutral-500 mb-6">
          We match this against your driver profile before starting every trip — this confirms the correct driver
          showed up.
        </p>
        <ErrorBanner message={error} />
        <Card>
          <div className="aspect-square bg-neutral-100 rounded-xl border border-dashed border-neutral-300 flex items-center justify-center mb-4">
            <span className="text-neutral-400 text-sm">Camera preview</span>
          </div>
          <Button className="w-full" loading={loading} onClick={onCapture}>
            Capture selfie & start trip
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
