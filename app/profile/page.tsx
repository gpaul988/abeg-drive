"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Badge, Button, Card, ErrorBanner, Field, Select, SuccessBanner, TextInput } from "@/components/ui";
import { apiGet, apiPost, getSession } from "@/lib/apiClient";
import { customerNavLinks } from "@/lib/navLinks";

interface Vehicle {
  make: string;
  model: string;
  plateNumber: string;
  transmissionType: "manual" | "automatic";
}

interface Me {
  phone: string;
  email: string;
  verificationStatus: string;
  profile?: { savedVehicles: Vehicle[]; trustScore: number };
}

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [transmissionType, setTransmissionType] = useState<"manual" | "automatic">("automatic");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function loadMe() {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<Me>("/customers/me", session.accessToken).then(({ status, data }) => {
      if (status === 200) setMe(data);
    });
  }

  useEffect(loadMe, [router]);

  async function addVehicle(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!make || !model || !plateNumber) {
      setError("Please fill in every field.");
      return;
    }
    setLoading(true);
    const session = getSession()!;
    const { status, data } = await apiPost<{ error?: string }>(
      "/customers/me/vehicles",
      { make, model, plateNumber, transmissionType },
      session.accessToken
    );
    setLoading(false);
    if (status !== 201) {
      setError("Couldn't save that vehicle — check the plate number format.");
      return;
    }
    setSuccess("Vehicle saved.");
    setMake("");
    setModel("");
    setPlateNumber("");
    setShowAddVehicle(false);
    loadMe();
  }

  if (!me) {
    return (
      <AppShell navLinks={customerNavLinks} activeHref="/profile" roleLabel="Customer">
        <p className="text-paper-faint text-sm">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell navLinks={customerNavLinks} activeHref="/profile" roleLabel="Customer">
      <h1 className="text-xl font-semibold text-paper mb-6">Profile</h1>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <p className="text-sm text-paper-dim mb-1">Phone</p>
          <p className="font-medium text-paper mb-4">{me.phone}</p>
          <p className="text-sm text-paper-dim mb-1">Email</p>
          <p className="font-medium text-paper">{me.email}</p>
        </Card>
        <Card>
          <p className="text-sm text-paper-dim mb-2">Identity verification</p>
          <Badge tone={me.verificationStatus === "verified" ? "success" : "warning"}>
            {me.verificationStatus}
          </Badge>
          <p className="text-sm text-paper-dim mt-4 mb-1">Trust score</p>
          <p className="font-medium text-paper">{me.profile?.trustScore ?? 100}/100</p>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium text-paper">Saved vehicles</h2>
        <button className="text-sm text-amber-strong font-medium" onClick={() => setShowAddVehicle((s) => !s)}>
          {showAddVehicle ? "Cancel" : "+ Add vehicle"}
        </button>
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {showAddVehicle && (
        <Card className="mb-4">
          <form onSubmit={addVehicle}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Make">
                <TextInput value={make} onChange={(e) => setMake(e.target.value)} placeholder="Toyota" />
              </Field>
              <Field label="Model">
                <TextInput value={model} onChange={(e) => setModel(e.target.value)} placeholder="Camry" />
              </Field>
            </div>
            <Field label="Plate number">
              <TextInput
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="RIV-123-XY"
              />
            </Field>
            <Field label="Transmission">
              <Select value={transmissionType} onChange={(e) => setTransmissionType(e.target.value as "manual" | "automatic")}>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </Select>
            </Field>
            <Button type="submit" loading={loading} className="w-full">
              Save vehicle
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-3 mb-6">
        {(me.profile?.savedVehicles ?? []).map((v, i) => (
          <Card key={i}>
            <p className="font-medium text-paper">
              {v.make} {v.model}
            </p>
            <p className="text-sm text-paper-dim">
              {v.plateNumber} · {v.transmissionType}
            </p>
          </Card>
        ))}
        {(me.profile?.savedVehicles ?? []).length === 0 && !showAddVehicle && (
          <p className="text-sm text-paper-faint">No saved vehicles yet.</p>
        )}
      </div>

      <a href="/profile/emergency-contacts" className="text-sm text-amber-strong font-medium">
        Manage emergency contacts →
      </a>
    </AppShell>
  );
}
