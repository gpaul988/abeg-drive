import { NextResponse } from "next/server";
import { BaseUser, CorporateAccount } from "./types";
import { getCorporateAccount } from "./repositories/corporateRepository";

export async function loadCorporateAccountForUser(
  corporateId: string,
  user: BaseUser
): Promise<{ account: CorporateAccount } | { error: NextResponse }> {
  const account = await getCorporateAccount(corporateId);
  if (!account) {
    return { error: NextResponse.json({ error: "corporate_account_not_found" }, { status: 404 }) };
  }

  const internalRoles = ["platform_admin", "super_admin"];
  if (account.ownerUserId !== user.id && !internalRoles.includes(user.role)) {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }

  return { account };
}
