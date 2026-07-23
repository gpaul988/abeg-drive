import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { findCorporateAccountByOwner } from "@/lib/repositories/corporateRepository";

export async function GET(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  if (auth.user.role !== "corporate_admin") {
    return NextResponse.json({ error: "corporate_admin_role_required" }, { status: 403 });
  }

  const account = await findCorporateAccountByOwner(auth.user.id);
  if (!account) {
    return NextResponse.json({ error: "corporate_account_not_found" }, { status: 404 });
  }

  return NextResponse.json({ account });
}
