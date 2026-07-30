"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, ErrorBanner, PrimaryButton, TextField } from "@/components/AuthShell";
import { apiPost, getSignupState } from "@/lib/apiClient";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    const state = getSignupState();
    if (!state) {
      router.replace("/signup");
      return;
    }
    setUserId(state.userId);
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<{ verified: boolean; error?: string }>("/auth/verify-email-otp", {
      userId,
      code,
    });
    setLoading(false);
    if (status !== 200 || !data.verified) {
      setError(data.error === "invalid_or_expired_otp" ? "That code is incorrect or expired." : "Something went wrong.");
      return;
    }
    router.push("/signup/identity");
  }

  async function onResend() {
    setResending(true);
    setError(null);
    await apiPost("/auth/send-email-otp", { userId });
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  }

  return (
    <AuthShell step={3} totalSteps={5} title="Verify your email" subtitle="Enter the 6-digit code we just emailed you">
      <form onSubmit={onSubmit}>
        <ErrorBanner message={error} />
        <TextField
          label="Verification code"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
        <PrimaryButton type="submit" loading={loading} disabled={code.length !== 6}>
          Verify
        </PrimaryButton>
        <button
          type="button"
          onClick={onResend}
          disabled={resending}
          className="w-full text-xs text-amber-strong font-medium text-center mt-4"
        >
          {resent ? "Code resent — check your email" : resending ? "Sending…" : "Resend code"}
        </button>
        <p className="text-xs text-paper-faint text-center mt-4">
          Dev mode: check the server console log for your email verification code.
        </p>
      </form>
    </AuthShell>
  );
}
