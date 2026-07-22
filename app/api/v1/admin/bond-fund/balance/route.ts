import { NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { getBondFundBalance, listBondFundLedger } from "@/lib/repositories/bondFundRepository";

export async function GET(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const [balance, ledger] = await Promise.all([getBondFundBalance(), listBondFundLedger()]);

  return NextResponse.json({
    balance,
    recentEntries: ledger.slice(0, 50),
    claimsPending: ledger.filter((e) => e.claimId).length,
  });
}
