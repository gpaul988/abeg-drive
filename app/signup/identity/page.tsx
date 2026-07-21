"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, ErrorBanner, PrimaryButton, TextField } from "@/components/AuthShell";
import { apiPost, getSignupState } from "@/lib/apiClient";

export default function IdentityPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [nin, setNin] = useState("");
  const [stage, setStage] = useState<"nin" | "selfie">("nin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const state = getSignupState();
    if (!state) {
      router.replace("/signup");
      return;
    }
    setUserId(state.userId);
  }, [router]);

  async function onSubmitNin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<{ verified: boolean; reason?: string }>(
      "/auth/identity/nin-verify",
      { userId, ninNumber: nin }
    );
    setLoading(false);
    if (status !== 200 || !data.verified) {
      setError("We couldn't verify that NIN. Please double-check the 11-digit number and try again.");
      return;
    }
    setStage("selfie");
  }

  async function onCaptureSelfie() {
    setError(null);
    setLoading(true);
    // In production this triggers the device camera + liveness SDK and
    // uploads the captured frame. The dev stub sends a placeholder payload.
    const { status, data } = await apiPost<{ match: boolean }>("/auth/identity/selfie-liveness", {
      userId,
      selfieImageBase64: "dev-placeholder-selfie-data",
    });
    setLoading(false);
    if (status !== 200 || !data.match) {
      setError("Liveness check failed. Please make sure your face is clearly visible and try again.");
      return;
    }
    router.push("/signup/payment-method");
  }

  return (
    <AuthShell
      step={3}
      totalSteps={4}
      title={stage === "nin" ? "Verify your identity" : "Take a quick selfie"}
      subtitle={
        stage === "nin"
          ? "Your NIN is required before your first booking, per our safety policy"
          : "We match this against your ID to confirm it's really you"
      }
    >
      {stage === "nin" ? (
        <form onSubmit={onSubmitNin}>
          <ErrorBanner message={error} />
          <TextField
            label="National Identification Number (NIN)"
            inputMode="numeric"
            maxLength={11}
            placeholder="12345678901"
            required
            value={nin}
            onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
          />
          <PrimaryButton type="submit" loading={loading} disabled={nin.length !== 11}>
            Verify NIN
          </PrimaryButton>
        </form>
      ) : (
        <div>
          <ErrorBanner message={error} />
          <div className="aspect-square bg-neutral-100 rounded-xl border border-dashed border-neutral-300 flex items-center justify-center mb-4">
            <span className="text-neutral-400 text-sm">Camera preview</span>
          </div>
          <PrimaryButton type="button" loading={loading} onClick={onCaptureSelfie}>
            Capture selfie
          </PrimaryButton>
        </div>
      )}
    </AuthShell>
  );
}
