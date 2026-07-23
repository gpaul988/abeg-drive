"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, ErrorBanner, PrimaryButton, TextField } from "@/components/AuthShell";
import { apiPost, saveSession } from "@/lib/apiClient";

export default function PartnerSignupPage() {
  const router = useRouter();
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<{ accessToken: string; refreshToken: string; error?: string }>(
      "/partner/signup",
      { venueName, address, contactPerson, contactPhone, adminEmail, adminPassword }
    );
    setLoading(false);
    if (status !== 201) {
      setError(humanizeError(data.error));
      return;
    }
    saveSession({ userId: "", accessToken: data.accessToken, refreshToken: data.refreshToken, role: "venue_partner" });
    router.push("/partner/dashboard");
  }

  return (
    <AuthShell
      title="Become a venue partner"
      subtitle="Hotels, event centers, and bars — offer your guests a safe ride home"
    >
      <form onSubmit={onSubmit}>
        <ErrorBanner message={error} />
        <TextField label="Venue name" required value={venueName} onChange={(e) => setVenueName(e.target.value)} />
        <TextField label="Address" required value={address} onChange={(e) => setAddress(e.target.value)} />
        <TextField
          label="Contact person"
          required
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
        />
        <TextField
          label="Contact phone"
          type="tel"
          placeholder="080XXXXXXXX"
          required
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
        <TextField
          label="Your email"
          type="email"
          required
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
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
          Apply as a venue partner
        </PrimaryButton>
        <p className="text-xs text-paper-faint text-center mt-4">
          New venues start un-whitelisted pending a quick review by our ops team.
        </p>
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
