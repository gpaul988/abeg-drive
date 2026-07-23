"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, ErrorBanner, PrimaryButton, TextField } from "@/components/AuthShell";
import { apiPost, saveSignupState } from "@/lib/apiClient";

type Stage = "details" | "otp";

export default function DriverSignupPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("details");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmitDetails(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<{ userId: string; phone: string; error?: string }>("/auth/signup", {
      phone,
      email,
      password,
      role: "driver",
    });
    setLoading(false);
    if (status !== 201) {
      setError(humanizeError(data.error));
      return;
    }
    setUserId(data.userId);
    saveSignupState({ userId: data.userId, phone: data.phone });
    setStage("otp");
  }

  async function onSubmitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<{ error?: string }>("/auth/verify-otp", { phone, code });
    setLoading(false);
    if (status !== 200) {
      setError(data.error === "invalid_or_expired_otp" ? "That code is incorrect or expired." : "Something went wrong.");
      return;
    }
    router.push("/driver/onboarding");
  }

  return (
    <AuthShell
      step={stage === "details" ? 1 : 2}
      totalSteps={2}
      title={stage === "details" ? "Apply to drive with AbegDrive" : "Verify your phone"}
      subtitle={
        stage === "details"
          ? "Professional driver application — background check and vetting required"
          : `Enter the 6-digit code sent to ${phone}`
      }
    >
      {stage === "details" ? (
        <form onSubmit={onSubmitDetails}>
          <ErrorBanner message={error} />
          <TextField
            label="Phone number"
            type="tel"
            placeholder="080XXXXXXXX"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PrimaryButton type="submit" loading={loading}>
            Continue
          </PrimaryButton>
          <p className="text-xs text-paper-dim text-center mt-4">
            Already applying?{" "}
            <a href="/login" className="text-amber-strong font-medium">
              Log in
            </a>
          </p>
        </form>
      ) : (
        <form onSubmit={onSubmitOtp}>
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
          <p className="text-xs text-paper-faint text-center mt-4">
            Dev mode: check the server console log for your OTP code.
          </p>
        </form>
      )}
    </AuthShell>
  );
}

function humanizeError(code?: string): string {
  switch (code) {
    case "phone_already_registered":
      return "That phone number is already registered. Try logging in instead.";
    case "email_already_registered":
      return "That email is already registered. Try logging in instead.";
    default:
      return "Please check your details and try again.";
  }
}
