"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Button, Card, ErrorBanner, Field, SuccessBanner, TextInput } from "@/components/ui";
import { apiPost, getSession } from "@/lib/apiClient";
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

export default function AccountSecurityPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setRole(session.role);
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
    const { status, data } = await apiPost<{ error?: string }>(
      "/auth/change-password",
      { currentPassword, newPassword },
      session.accessToken
    );
    setLoading(false);
    if (status !== 200) {
      setError(
        data.error === "current_password_incorrect"
          ? "Your current password is incorrect."
          : "Something went wrong. Please try again."
      );
      return;
    }
    setSuccess("Password updated.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  if (!role) return null;

  const nav = NAV_BY_ROLE[role] ?? { links: [], label: "Account" };

  return (
    <AppShell navLinks={nav.links} activeHref="/account/security" roleLabel={nav.label}>
      <div className="max-w-md">
        <h1 className="text-xl font-semibold text-paper mb-2">Account security</h1>
        <p className="text-sm text-paper-dim mb-6">Update the password used to log in to your AbegDrive account.</p>

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
            <Field label="New password" hint="At least 8 characters">
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
    </AppShell>
  );
}
