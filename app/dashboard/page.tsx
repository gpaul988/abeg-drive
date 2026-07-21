"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, clearSession, getSession } from "@/lib/apiClient";

interface Me {
  id: string;
  phone: string;
  email: string;
  role: string;
  verificationStatus: string;
  onboardingComplete: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<Me>("/customers/me", session.accessToken).then(({ status, data }) => {
      if (status !== 200) {
        clearSession();
        router.replace("/login");
        return;
      }
      setMe(data);
      setLoading(false);
    });
  }, [router]);

  if (loading || !me) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-400 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white text-sm font-bold">
              S
            </div>
            <span className="font-semibold text-neutral-900">SafeKeys</span>
          </div>
          <button
            onClick={() => {
              clearSession();
              router.push("/login");
            }}
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">
          Welcome{me.email ? `, ${me.email.split("@")[0]}` : ""}
        </h1>
        <p className="text-neutral-500 mb-8">Ready when you are.</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <p className="text-sm text-neutral-500 mb-1">Verification status</p>
            <p className="font-medium capitalize text-neutral-900">{me.verificationStatus}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <p className="text-sm text-neutral-500 mb-1">Onboarding</p>
            <p className="font-medium text-neutral-900">
              {me.onboardingComplete ? "Complete — you can book a driver" : "Incomplete"}
            </p>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-center">
          <p className="text-neutral-500 text-sm">
            Booking flow (<code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded">/book</code>) ships in the
            next module — <strong>trips</strong>.
          </p>
        </div>
      </main>
    </div>
  );
}
