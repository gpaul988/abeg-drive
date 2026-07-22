"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, ErrorBanner, PrimaryButton, TextField } from "@/components/AuthShell";
import { apiPost, saveSession } from "@/lib/apiClient";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: string };
  error?: string;
  requiresTotp?: boolean;
}

const INTERNAL_ROLES = ["platform_admin", "security_agent", "super_admin"];

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<LoginResponse>("/auth/login", {
      identifier,
      password,
      totpCode: needsTotp ? totpCode : undefined,
    });
    setLoading(false);

    if (status === 401 && data.requiresTotp) {
      setNeedsTotp(true);
      return;
    }
    if (status !== 200) {
      setError(humanizeError(data.error));
      return;
    }
    if (!INTERNAL_ROLES.includes(data.user.role)) {
      setError("This login is for internal staff accounts only.");
      return;
    }

    saveSession({
      userId: data.user.id,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: data.user.role,
    });

    if (data.user.role === "security_agent") {
      router.push("/security/dashboard");
    } else {
      router.push("/admin/dashboard");
    }
  }

  return (
    <AuthShell
      title="Internal staff login"
      subtitle="Platform Admin, Super Admin, and Security Agent accounts — 2FA required"
    >
      <form onSubmit={onSubmit}>
        <ErrorBanner message={error} />
        <TextField
          label="Email"
          type="email"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={needsTotp}
        />
        <TextField
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={needsTotp}
        />
        {needsTotp && (
          <TextField
            label="Authenticator code"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            required
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
          />
        )}
        <PrimaryButton type="submit" loading={loading}>
          {needsTotp ? "Verify & log in" : "Continue"}
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}

function humanizeError(code?: string): string {
  switch (code) {
    case "invalid_credentials":
      return "Incorrect email or password.";
    case "invalid_totp_code":
      return "That authenticator code is incorrect or expired.";
    case "2fa_not_provisioned_contact_super_admin":
      return "Your account isn't set up for 2FA yet. Contact a Super Admin.";
    default:
      return "Something went wrong. Please try again.";
  }
}
