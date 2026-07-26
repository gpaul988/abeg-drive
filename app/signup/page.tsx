"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell, ErrorBanner, PrimaryButton, TextField } from "@/components/AuthShell";
import { apiPost, saveSignupState } from "@/lib/apiClient";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referredByCode, setReferredByCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferredByCode(ref.toUpperCase());
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<{ userId: string; phone: string; error?: string }>(
      "/auth/signup",
      { phone, email, password, role: "customer", referredByCode: referredByCode || undefined }
    );
    setLoading(false);
    if (status !== 201) {
      setError(humanizeError(data.error));
      return;
    }
    saveSignupState({ userId: data.userId, phone: data.phone });
    router.push("/signup/verify-otp");
  }

  return (
    <AuthShell step={1} totalSteps={4} title="Create your account" subtitle="Book a verified driver in minutes">
      <form onSubmit={onSubmit}>
        <ErrorBanner message={error} />
        {referredByCode && (
          <div className="mb-4 text-sm text-teal-strong bg-teal/10 border border-teal/30 rounded-lg px-3 py-2">
            Referred by <span className="font-mono">{referredByCode}</span>
          </div>
        )}
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
          Already have an account?{" "}
          <a href="/login" className="text-amber-strong font-medium">
            Log in
          </a>
        </p>
      </form>
    </AuthShell>
  );
}

function humanizeError(code?: string): string {
  switch (code) {
    case "phone_already_registered":
      return "That phone number is already registered. Try logging in instead.";
    case "email_already_registered":
      return "That email is already registered. Try logging in instead.";
    case "validation_error":
      return "Please check your details — phone must be a valid Nigerian number, and password needs 8+ characters with upper, lower, and a number.";
    default:
      return "Something went wrong. Please try again.";
  }
}
