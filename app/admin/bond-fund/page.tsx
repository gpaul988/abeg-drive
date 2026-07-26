"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Button, Card, ErrorBanner, SuccessBanner } from "@/components/ui";
import { apiGet, apiPost, getSession } from "@/lib/apiClient";
import { getAdminNavLinks } from "@/lib/navLinks";

interface LedgerEntry {
  id: string;
  tripId: string;
  contributionAmount: number;
  runningBalance: number;
  claimId?: string;
  createdAt: string;
}

interface BondFundData {
  balance: number;
  recentEntries: LedgerEntry[];
  claimsPending: number;
}

export default function BondFundPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [data, setData] = useState<BondFundData | null>(null);
  const [payoutIncidentId, setPayoutIncidentId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutTotp, setPayoutTotp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function load() {
    const session = getSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setRole(session.role);
    apiGet<BondFundData>("/admin/bond-fund/balance", session.accessToken).then(({ status, data }) => {
      if (status === 200) setData(data);
    });
  }

  useEffect(load, [router]);

  async function onPayout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!payoutIncidentId || !payoutAmount) {
      setError("Please provide an incident ID and payout amount.");
      return;
    }
    if (!payoutTotp) {
      setError("Enter your current authenticator code to authorize this payout.");
      return;
    }
    const session = getSession()!;
    const { status, data: res } = await apiPost<{ error?: string; currentBalance?: number }>(
      `/admin/bond-fund/claims/${payoutIncidentId}/payout`,
      { amount: Number(payoutAmount), totpCode: payoutTotp },
      session.accessToken
    );
    if (status !== 200) {
      setError(
        res.error === "insufficient_bond_fund_balance"
          ? `Insufficient balance — current balance is ₦${res.currentBalance?.toLocaleString()}.`
          : res.error === "invalid_totp_code"
          ? "That authenticator code is incorrect or expired."
          : "Couldn't process this payout."
      );
      return;
    }
    setSuccess("Claim paid out and incident marked resolved.");
    setPayoutIncidentId("");
    setPayoutAmount("");
    setPayoutTotp("");
    load();
  }

  return (
    <AppShell navLinks={getAdminNavLinks(role)} activeHref="/admin/bond-fund" roleLabel="Admin">
      <h1 className="text-xl font-semibold text-paper mb-2">Bond fund</h1>
      <p className="text-sm text-paper-dim mb-6">
        A self-funded reserve pool (3% of every trip fare) used as an interim insurance mechanism until a formal
        insurtech partnership is signed.
      </p>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <p className="text-sm text-paper-dim mb-1">Current balance</p>
          <p className="text-3xl font-semibold text-paper">₦{(data?.balance ?? 0).toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-sm text-paper-dim mb-1">Claims paid to date</p>
          <p className="text-3xl font-semibold text-paper">{data?.claimsPending ?? 0}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="font-medium text-paper mb-3">Process a claim payout</h2>
        <p className="text-xs text-paper-faint mb-3">
          Moving money out of the bond fund requires your current authenticator code, even within an active
          session — this action is too consequential to rely on the session token alone.
        </p>
        <form onSubmit={onPayout} className="flex flex-col sm:flex-row gap-2">
          <input
            className="flex-1 bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50"
            placeholder="Incident ID"
            value={payoutIncidentId}
            onChange={(e) => setPayoutIncidentId(e.target.value)}
          />
          <input
            type="number"
            className="w-full sm:w-32 bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50"
            placeholder="Amount (₦)"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
          />
          <input
            className="w-full sm:w-28 bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50 font-mono"
            placeholder="2FA code"
            inputMode="numeric"
            maxLength={6}
            value={payoutTotp}
            onChange={(e) => setPayoutTotp(e.target.value.replace(/\D/g, ""))}
          />
          <Button type="submit">Pay out</Button>
        </form>
      </Card>

      <h2 className="font-medium text-paper mb-3">Recent ledger entries</h2>
      <div className="space-y-2">
        {data?.recentEntries.map((e) => (
          <Card key={e.id} className="flex items-center justify-between py-3">
            <span className="text-xs text-paper-faint">{new Date(e.createdAt).toLocaleString("en-NG")}</span>
            <span className={`text-sm font-medium ${e.contributionAmount < 0 ? "text-danger" : "text-success"}`}>
              {e.contributionAmount < 0 ? "-" : "+"}₦{Math.abs(e.contributionAmount).toLocaleString()}
            </span>
            <span className="text-sm text-paper-dim">Balance: ₦{e.runningBalance.toLocaleString()}</span>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
