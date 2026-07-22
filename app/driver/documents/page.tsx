"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { driverNavLinks } from "@/lib/navLinks";

interface DriverProfile {
  licenseNumber?: string;
  licenseExpiry?: string;
  backgroundCheckStatus: string;
  addressVerified: boolean;
}

export default function DriverDocumentsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DriverProfile | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<{ profile: DriverProfile }>("/drivers/me", session.accessToken).then(({ status, data }) => {
      if (status === 200) setProfile(data.profile);
    });
  }, [router]);

  const daysUntilExpiry = profile?.licenseExpiry
    ? Math.round((new Date(profile.licenseExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <AppShell navLinks={driverNavLinks} activeHref="/driver/documents" roleLabel="Driver">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Documents</h1>

      {!profile && <p className="text-sm text-neutral-400">Loading…</p>}

      {profile && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-neutral-900">Driver&apos;s license</p>
              {daysUntilExpiry !== null && (
                <Badge tone={daysUntilExpiry < 30 ? "danger" : "success"}>
                  {daysUntilExpiry < 0 ? "Expired" : `${daysUntilExpiry} days left`}
                </Badge>
              )}
            </div>
            <p className="text-sm text-neutral-500">{profile.licenseNumber ?? "Not on file"}</p>
            {profile.licenseExpiry && (
              <p className="text-xs text-neutral-400 mt-1">
                Expires {new Date(profile.licenseExpiry).toLocaleDateString("en-NG", { dateStyle: "long" })}
              </p>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <p className="font-medium text-neutral-900">Background check</p>
              <Badge tone={profile.backgroundCheckStatus === "cleared" ? "success" : "warning"}>
                {profile.backgroundCheckStatus.replace("_", " ")}
              </Badge>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <p className="font-medium text-neutral-900">Address verification</p>
              <Badge tone={profile.addressVerified ? "success" : "warning"}>
                {profile.addressVerified ? "Verified" : "Pending field visit"}
              </Badge>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
