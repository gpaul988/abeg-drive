"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, ErrorBanner, PrimaryButton, TextField } from "@/components/AuthShell";
import { apiPost, saveSession } from "@/lib/apiClient";

export default function CorporateSignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [billingContact, setBillingContact] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<{
      accessToken: string;
      refreshToken: string;
      corporateAccountId: string;
      error?: string;
    }>("/corporate/signup", { companyName, rcNumber, billingContact, adminEmail, adminPhone, adminPassword });
    setLoading(false);
    if (status !== 201) {
      setError(humanizeError(data.error));
      return;
    }
    saveSession({
      userId: "", // resolved from token server-side on next request
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: "corporate_admin",
    });
    router.push("/corporate/dashboard");
  }

  return (
    <AuthShell
      title="AbegDrive for Business"
      subtitle="Set up a corporate account for your organization's safe-ride policy"
    >
      <form onSubmit={onSubmit}>
        <ErrorBanner message={error} />
        <TextField
          label="Company name"
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <TextField
          label="RC number"
          placeholder="RC1234567"
          required
          value={rcNumber}
          onChange={(e) => setRcNumber(e.target.value)}
        />
        <TextField
          label="Billing contact email"
          type="email"
          required
          value={billingContact}
          onChange={(e) => setBillingContact(e.target.value)}
        />
        <TextField
          label="Your email (account admin)"
          type="email"
          required
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
        />
        <TextField
          label="Your phone"
          type="tel"
          placeholder="080XXXXXXXX"
          required
          value={adminPhone}
          onChange={(e) => setAdminPhone(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          minLength={8}
          required
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
        />
        <PrimaryButton type="submit" loading={loading}>
          Create corporate account
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}

function humanizeError(code?: string): string {
  switch (code) {
    case "email_already_registered":
      return "That email is already registered.";
    case "phone_already_registered":
      return "That phone number is already registered.";
    default:
      return "Please check your details and try again.";
  }
}
