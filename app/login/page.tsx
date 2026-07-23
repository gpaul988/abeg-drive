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
}

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<LoginResponse>("/auth/login", { identifier, password });
    setLoading(false);
    if (status !== 200) {
      setError("Incorrect phone/email or password.");
      return;
    }
    saveSession({
      userId: data.user.id,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: data.user.role,
    });
    router.push("/dashboard");
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to book your ride home">
      <form onSubmit={onSubmit}>
        <ErrorBanner message={error} />
        <TextField
          label="Phone or email"
          placeholder="080XXXXXXXX or you@example.com"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="text-right mb-4 -mt-2">
          <a href="/forgot-password" className="text-xs text-amber-strong font-medium">
            Forgot password?
          </a>
        </div>
        <PrimaryButton type="submit" loading={loading}>
          Log in
        </PrimaryButton>
        <p className="text-xs text-paper-dim text-center mt-4">
          New to AbegDrive?{" "}
          <a href="/signup" className="text-amber-strong font-medium">
            Create an account
          </a>
        </p>
      </form>
    </AuthShell>
  );
}
