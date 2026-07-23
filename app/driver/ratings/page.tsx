"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Card } from "@/components/ui";
import { apiGet, getSession } from "@/lib/apiClient";
import { driverNavLinks } from "@/lib/navLinks";

interface DriverProfile {
  ratingAvg: number;
  ratingCount: number;
}

interface Trip {
  id: string;
  ratingCustomerToDriver?: number;
  ratingComment?: string;
  completedAt?: string;
}

export default function DriverRatingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<{ profile: DriverProfile }>("/drivers/me", session.accessToken).then(({ status, data }) => {
      if (status === 200) setProfile(data.profile);
    });
    apiGet<{ trips: Trip[] }>("/trips", session.accessToken).then(({ status, data }) => {
      if (status === 200) setTrips(data.trips.filter((t) => t.ratingCustomerToDriver));
    });
  }, [router]);

  return (
    <AppShell navLinks={driverNavLinks} activeHref="/driver/ratings" roleLabel="Driver">
      <h1 className="text-xl font-semibold text-paper mb-6">Ratings</h1>

      <Card className="mb-6">
        <p className="text-sm text-paper-dim mb-1">Average rating</p>
        <p className="text-3xl font-semibold text-paper">
          {profile ? `★ ${profile.ratingAvg.toFixed(1)}` : "—"}
        </p>
        <p className="text-xs text-paper-faint mt-1">{profile?.ratingCount ?? 0} ratings total</p>
      </Card>

      <h2 className="font-medium text-paper mb-3">Recent feedback</h2>
      {trips.length === 0 && <p className="text-sm text-paper-faint">No feedback yet.</p>}
      <div className="space-y-3">
        {trips.map((t) => (
          <Card key={t.id}>
            <p className="text-sm font-medium text-paper mb-1">★ {t.ratingCustomerToDriver}</p>
            {t.ratingComment && <p className="text-sm text-paper-dim">&ldquo;{t.ratingComment}&rdquo;</p>}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
