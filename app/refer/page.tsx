"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { customerNavLinks } from "@/lib/navLinks";

interface Me {
  profile?: { referralCode: string; referralCount: number; referredByCode?: string };
}

export default function ReferPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<Me>("/customers/me", session.accessToken).then(({ status, data }) => {
      if (status === 200) {
        setMe(data);
        if (data.profile) {
          setShareUrl(`${window.location.origin}/signup?ref=${data.profile.referralCode}`);
        }
      }
    });
  }, [router]);

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!me?.profile) {
    return (
      <AppShell navLinks={customerNavLinks} activeHref="/refer" roleLabel="Customer">
        <p className="text-paper-faint text-sm">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell navLinks={customerNavLinks} activeHref="/refer" roleLabel="Customer">
      <div className="max-w-lg">
        <h1 className="text-xl font-semibold text-paper mb-2">Refer a friend</h1>
        <p className="text-sm text-paper-dim mb-6">
          Share your link — anyone who signs up with it is credited to you, right from their first ride.
        </p>

        <Card className="mb-6">
          <p className="text-xs text-paper-faint mb-2">Your referral code</p>
          <p className="font-mono text-2xl font-semibold text-amber-strong mb-4">{me.profile.referralCode}</p>

          <p className="text-xs text-paper-faint mb-1">Share this link</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-xs text-paper-dim font-mono"
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-amber hover:bg-amber-strong text-ink-950 transition-colors shrink-0"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <p className="text-sm text-paper-faint mb-1">Friends referred</p>
            <p className="text-2xl font-semibold text-paper">{me.profile.referralCount}</p>
          </Card>
          {me.profile.referredByCode && (
            <Card>
              <p className="text-sm text-paper-faint mb-1">You were referred by</p>
              <p className="font-mono text-paper">{me.profile.referredByCode}</p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
