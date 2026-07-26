"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { AppShell, Badge, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { partnerNavLinks } from "@/lib/navLinks";

interface Venue {
  id: string;
  venueName: string;
  whitelisted: boolean;
}

export default function CoBrandingPage() {
  const router = useRouter();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<{ venue: Venue }>("/partner/me", session.accessToken).then(({ status, data }) => {
      if (status !== 200) return;
      setVenue(data.venue);
      const url = `${window.location.origin}/how-it-works?venue=${data.venue.id}`;
      setPosterUrl(url);
      QRCode.toDataURL(url, { margin: 1, width: 320, color: { dark: "#0B0F14", light: "#F5A62300" } }).then(
        setQrDataUrl
      );
    });
  }, [router]);

  if (!venue) {
    return (
      <AppShell navLinks={partnerNavLinks} activeHref="/partner/co-branding" roleLabel="Venue Partner">
        <p className="text-paper-faint text-sm">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell navLinks={partnerNavLinks} activeHref="/partner/co-branding" roleLabel="Venue Partner">
      <div className="max-w-lg">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-xl font-semibold text-paper">Co-branding assets</h1>
          <Badge tone={venue.whitelisted ? "success" : "warning"}>
            {venue.whitelisted ? "Whitelisted" : "Pending approval"}
          </Badge>
        </div>
        <p className="text-sm text-paper-dim mb-6">
          Promote your &quot;safe ride home&quot; partnership with a scannable QR code guests can use right from
          your front desk, table tents, or receipts.
        </p>

        {!venue.whitelisted && (
          <Card className="mb-6 border-amber/30">
            <p className="text-sm text-paper-dim">
              These assets work best once your venue is whitelisted — a guest scanning this code today can still
              learn how AbegDrive works, but you can&apos;t request drivers on their behalf until approval clears.
            </p>
          </Card>
        )}

        <Card className="text-center mb-6">
          <p className="text-xs text-paper-faint mb-4 uppercase tracking-wide">Scan for a safe ride home</p>
          {qrDataUrl && (
            <div className="inline-block bg-paper rounded-xl p-4 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR code linking to AbegDrive" className="w-48 h-48" />
            </div>
          )}
          <p className="font-display font-semibold text-paper text-lg">{venue.venueName}</p>
          <p className="text-xs text-paper-faint mt-1">Proud AbegDrive safety partner</p>
        </Card>

        <Card>
          <p className="text-xs text-paper-faint mb-1">Link this QR code points to</p>
          <code className="text-xs text-paper-dim break-all font-mono">{posterUrl}</code>
        </Card>

        <p className="text-xs text-paper-faint mt-6">
          Full print-ready poster templates and co-branded signage are planned for a future release — this QR code
          is fully functional today and safe to print now.
        </p>
      </div>
    </AppShell>
  );
}
