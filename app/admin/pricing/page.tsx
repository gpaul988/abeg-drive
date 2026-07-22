"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Button, Card, ErrorBanner, Field, SuccessBanner, TextInput } from "@/components/ui";
import { apiGet, apiPut, getSession } from "@/lib/apiClient";
import { getAdminNavLinks } from "@/lib/navLinks";

interface PricingConfig {
  baseFare: number;
  perKmRate: number;
  escortSurcharge: number;
  surgeEnabled: boolean;
  surgeMultiplier: number;
  corporateDiscountPct: number;
  updatedAt: string;
}

export default function AdminPricingPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setRole(session.role);
    apiGet<{ config: PricingConfig }>("/admin/pricing", session.accessToken).then(({ status, data }) => {
      if (status === 200) setConfig(data.config);
    });
  }, [router]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setError(null);
    setLoading(true);
    const session = getSession()!;
    const { status, data } = await apiPut<{ config?: PricingConfig; error?: string }>(
      "/admin/pricing",
      {
        baseFare: config.baseFare,
        perKmRate: config.perKmRate,
        escortSurcharge: config.escortSurcharge,
        surgeEnabled: config.surgeEnabled,
        surgeMultiplier: config.surgeMultiplier,
        corporateDiscountPct: config.corporateDiscountPct,
      },
      session.accessToken
    );
    setLoading(false);
    if (status !== 200) {
      setError("Couldn't save pricing changes.");
      return;
    }
    setConfig(data.config!);
    setSuccess("Pricing updated — takes effect on the next fare estimate immediately.");
  }

  if (!config) {
    return (
      <AppShell navLinks={getAdminNavLinks(role)} activeHref="/admin/pricing" roleLabel="Admin">
        <p className="text-neutral-400 text-sm">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell navLinks={getAdminNavLinks(role)} activeHref="/admin/pricing" roleLabel="Admin">
      <h1 className="text-xl font-semibold text-neutral-900 mb-2">Pricing configuration</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Changes apply immediately to every new fare estimate — no deploy required.
      </p>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <Card>
        <form onSubmit={onSave}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Base fare (₦)">
              <TextInput
                type="number"
                value={config.baseFare}
                onChange={(e) => setConfig({ ...config, baseFare: Number(e.target.value) })}
              />
            </Field>
            <Field label="Per-km rate (₦)">
              <TextInput
                type="number"
                value={config.perKmRate}
                onChange={(e) => setConfig({ ...config, perKmRate: Number(e.target.value) })}
              />
            </Field>
            <Field label="Escort driver surcharge (₦)">
              <TextInput
                type="number"
                value={config.escortSurcharge}
                onChange={(e) => setConfig({ ...config, escortSurcharge: Number(e.target.value) })}
              />
            </Field>
            <Field label="Corporate discount (%)">
              <TextInput
                type="number"
                max={50}
                value={config.corporateDiscountPct}
                onChange={(e) => setConfig({ ...config, corporateDiscountPct: Number(e.target.value) })}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 my-4 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={config.surgeEnabled}
              onChange={(e) => setConfig({ ...config, surgeEnabled: e.target.checked })}
            />
            Enable surge pricing
          </label>

          {config.surgeEnabled && (
            <Field label="Surge multiplier" hint="e.g. 1.5 = fares are 50% higher during surge">
              <TextInput
                type="number"
                step="0.1"
                min={1}
                max={5}
                value={config.surgeMultiplier}
                onChange={(e) => setConfig({ ...config, surgeMultiplier: Number(e.target.value) })}
              />
            </Field>
          )}

          <Button type="submit" loading={loading} className="mt-2">
            Save changes
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
