"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Button, Card, ErrorBanner, Field, SuccessBanner, TextInput } from "@/components/ui";
import { apiGet, apiPost, getSession } from "@/lib/apiClient";
import {
  adminNavLinks,
  corporateNavLinks,
  customerNavLinks,
  driverNavLinks,
  partnerNavLinks,
  securityNavLinks,
} from "@/lib/navLinks";

const NAV_BY_ROLE: Record<string, { links: { href: string; label: string }[]; label: string }> = {
  customer: { links: customerNavLinks, label: "Customer" },
  driver: { links: driverNavLinks, label: "Driver" },
  platform_admin: { links: adminNavLinks, label: "Platform Admin" },
  super_admin: { links: adminNavLinks, label: "Super Admin" },
  security_agent: { links: securityNavLinks, label: "Security Agent" },
  corporate_admin: { links: corporateNavLinks, label: "Corporate Admin" },
  venue_partner: { links: partnerNavLinks, label: "Venue Partner" },
};

interface SessionRow {
  id: string;
  createdAt: string;
  expiresAt: string;
  userAgent: string;
}

function summarizeUserAgent(ua: string): string {
  if (ua === "Unknown device") return ua;
  if (/iphone/i.test(ua)) return "iPhone · Safari";
  if (/android/i.test(ua)) return "Android device";
  if (/chrome/i.test(ua)) return "Chrome · Desktop";
  if (/firefox/i.test(ua)) return "Firefox · Desktop";
  if (/safari/i.test(ua)) return "Safari · Desktop";
  return "Unknown device";
}

export default function AccountSecurityPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);

  function loadSessions() {
    const session = getSession();
    if (!session) return;
    apiGet<{ sessions: SessionRow[] }>("/auth/sessions", session.accessToken).then(({ status, data }) => {
      if (status === 200) setSessions(data.sessions);
    });
  }

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setRole(session.role);
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }
    setLoading(true);
    const session = getSession()!;
    const { status, data } = await apiPost<{ error?: string; details?: { fieldErrors?: { newPassword?: string[] } } }>(
      "/auth/change-password",
      { currentPassword, newPassword },
      session.accessToken
    );
    setLoading(false);
    if (status !== 200) {
      const fieldError = data.details?.fieldErrors?.newPassword?.[0];
      setError(
        data.error === "current_password_incorrect"
          ? "Your current password is incorrect."
          : fieldError ?? "Something went wrong. Please try again."
      );
      return;
    }
    setSuccess("Password updated.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function revokeSession(sessionId: string) {
    const session = getSession()!;
    await apiPost(`/auth/sessions/${sessionId}/revoke`, {}, session.accessToken);
    loadSessions();
  }

  if (!role) return null;

  const nav = NAV_BY_ROLE[role] ?? { links: [], label: "Account" };

  return (
    <AppShell navLinks={nav.links} activeHref="/account/security" roleLabel={nav.label}>
      <div className="max-w-md space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-paper mb-2">Account security</h1>
          <p className="text-sm text-paper-dim mb-6">
            Update the password used to log in to your AbegDrive account.
          </p>

          <ErrorBanner message={error} />
          <SuccessBanner message={success} />

          <Card>
            <form onSubmit={onSubmit}>
              <Field label="Current password">
                <TextInput
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Field>
              <Field
                label="New password"
                hint="At least 8 characters, with an uppercase letter, a lowercase letter, and a number"
              >
                <TextInput
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Field>
              <Field label="Confirm new password">
                <TextInput
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>
              <Button type="submit" loading={loading} className="w-full">
                Update password
              </Button>
            </form>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-paper mb-2">Active sessions</h2>
          <p className="text-sm text-paper-dim mb-4">
            Every device currently signed in to your account. If you don&apos;t recognize one, revoke it.
          </p>
          <div className="space-y-3">
            {sessions?.map((s) => (
              <Card key={s.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-paper">{summarizeUserAgent(s.userAgent)}</p>
                  <p className="text-xs text-paper-faint">
                    Signed in {new Date(s.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => revokeSession(s.id)}>
                  Revoke
                </Button>
              </Card>
            ))}
            {sessions && sessions.length === 0 && (
              <p className="text-sm text-paper-faint">No other active sessions.</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
