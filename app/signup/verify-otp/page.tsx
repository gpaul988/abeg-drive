"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, ErrorBanner, PrimaryButton, TextField } from "@/components/AuthShell";
import { apiPost, getSignupState } from "@/lib/apiClient";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const state = getSignupState();
    if (!state) {
      router.replace("/signup");
      return;
    }
    setPhone(state.phone);
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<{ userId: string; error?: string }>("/auth/verify-otp", {
      phone,
      code,
    });
    setLoading(false);
    if (status !== 200) {
      setError(data.error === "invalid_or_expired_otp" ? "That code is incorrect or expired." : "Something went wrong.");
      return;
    }
    router.push("/signup/identity");
  }

  return (
    <AuthShell
      step={2}
      totalSteps={4}
      title="Verify your phone"
      subtitle={phone ? `Enter the 6-digit code sent to ${phone}` : "Enter the 6-digit code we sent you"}
    >
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
        <p className="text-xs text-neutral-400 text-center mt-4">
          Dev mode: check the server console log for your OTP code.
        </p>
      </form>
    </AuthShell>
  );
}
