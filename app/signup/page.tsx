"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, ErrorBanner, PrimaryButton, TextField } from "@/components/AuthShell";
import { apiPost, saveSignupState } from "@/lib/apiClient";

export default function SignupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<{ userId: string; phone: string; error?: string }>(
      "/auth/signup",
      { phone, email, password, role: "customer" }
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
        <p className="text-xs text-neutral-500 text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-amber-600 font-medium">
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
      return "Please check your details — phone must be a valid Nigerian number and password at least 8 characters.";
    default:
      return "Something went wrong. Please try again.";
  }
}
