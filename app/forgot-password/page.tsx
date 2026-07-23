"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, ErrorBanner, PrimaryButton, TextField } from "@/components/AuthShell";
import { apiPost } from "@/lib/apiClient";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"request" | "reset">("request");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    await apiPost("/auth/forgot-password", { phone });
    setLoading(false);
    setStage("reset");
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { status, data } = await apiPost<{ error?: string }>("/auth/reset-password", {
      phone,
      code,
      newPassword,
    });
    setLoading(false);
    if (status !== 200) {
      setError(data.error === "invalid_or_expired_otp" ? "That code is incorrect or expired." : "Something went wrong.");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  if (success) {
    return (
      <AuthShell title="Password updated">
        <p className="text-sm text-paper-dim text-center">Redirecting you to log in…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={stage === "request" ? "Reset your password" : "Enter reset code"}
      subtitle={stage === "request" ? "We'll text you a reset code" : `Code sent to ${phone}`}
    >
      {stage === "request" ? (
        <form onSubmit={onRequestCode}>
          <ErrorBanner message={error} />
          <TextField
            label="Phone number"
            type="tel"
            placeholder="080XXXXXXXX"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <PrimaryButton type="submit" loading={loading}>
            Send reset code
          </PrimaryButton>
        </form>
      ) : (
        <form onSubmit={onReset}>
          <ErrorBanner message={error} />
          <TextField
            label="Reset code"
            inputMode="numeric"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          <TextField
            label="New password"
            type="password"
            minLength={8}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <PrimaryButton type="submit" loading={loading}>
            Update password
          </PrimaryButton>
        </form>
      )}
    </AuthShell>
  );
}
