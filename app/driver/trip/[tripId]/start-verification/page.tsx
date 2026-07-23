"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell, Card, ErrorBanner } from "@/components/ui";
import { SelfieCapture } from "@/components/SelfieCapture";
import { apiPost, getSession } from "@/lib/apiClient";
import { driverNavLinks } from "@/lib/navLinks";

export default function StartVerificationPage() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCapture(selfieImageBase64: string) {
    setError(null);
    setLoading(true);
    const session = getSession()!;
    const { status, data } = await apiPost<{ match: boolean; error?: string }>(
      `/drivers/me/trips/${params.tripId}/start-selfie-verify`,
      { selfieImageBase64 },
      session.accessToken
    );
    setLoading(false);
    if (status !== 200 || !data.match) {
      setError(
        data.error === "validation_error"
          ? "That doesn't look like a valid photo. Please retake your selfie."
          : "Liveness check failed — this confirms the correct driver is starting the trip. Please try again."
      );
      return;
    }
    router.push(`/driver/trip/${params.tripId}`);
  }

  return (
    <AppShell navLinks={driverNavLinks} activeHref="/driver/dashboard" roleLabel="Driver">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-paper mb-2">Confirm it&apos;s you</h1>
        <p className="text-sm text-paper-dim mb-6">
          We match this against your driver profile before starting every trip — this confirms the correct driver
          showed up.
        </p>
        <ErrorBanner message={error} />
        <Card>
          <SelfieCapture onCapture={onCapture} disabled={loading} />
        </Card>
      </div>
    </AppShell>
  );
}
