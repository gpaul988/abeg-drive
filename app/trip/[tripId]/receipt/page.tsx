"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { customerNavLinks } from "@/lib/navLinks";

interface Receipt {
  tripId: string;
  pickup: { address: string };
  destinations: { address: string }[];
  vehicle: { make: string; model: string; plateNumber: string };
  fareFinal: number;
  paymentStatus: string;
  completedAt?: string;
  createdAt: string;
}

export default function ReceiptPage() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<Receipt & { error?: string }>(`/trips/${params.tripId}/receipt`, session.accessToken).then(
      ({ status, data }) => {
        if (status !== 200) {
          setError("Receipt not available for this trip yet.");
          return;
        }
        setReceipt(data);
      }
    );
  }, [params.tripId, router]);

  return (
    <AppShell navLinks={customerNavLinks} activeHref="/trip-history" roleLabel="Customer">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-neutral-900 mb-4">Receipt</h1>
        {error && <p className="text-sm text-neutral-500">{error}</p>}
        {receipt && (
          <Card>
            <p className="text-xs text-neutral-400 mb-1">Trip ID</p>
            <p className="text-sm font-mono text-neutral-700 mb-4">{receipt.tripId}</p>

            <div className="space-y-1 text-sm mb-4">
              <p className="text-neutral-500">From</p>
              <p className="text-neutral-900">{receipt.pickup.address}</p>
              <p className="text-neutral-500 mt-2">To</p>
              {receipt.destinations.map((d, i) => (
                <p key={i} className="text-neutral-900">
                  {d.address}
                </p>
              ))}
            </div>

            <div className="text-sm mb-4">
              <p className="text-neutral-500">Vehicle</p>
              <p className="text-neutral-900">
                {receipt.vehicle.make} {receipt.vehicle.model} — {receipt.vehicle.plateNumber}
              </p>
            </div>

            <div className="flex justify-between border-t border-neutral-200 pt-4 font-semibold">
              <span className="text-neutral-900">Total paid</span>
              <span className="text-neutral-900">₦{receipt.fareFinal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 capitalize">Payment status: {receipt.paymentStatus}</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
