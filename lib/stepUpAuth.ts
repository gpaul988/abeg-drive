import { NextResponse } from "next/server";
import { verify as verifyTotp } from "otplib";
import { BaseUser } from "./types";

// Closes a real gap: an admin's access token is valid for its full 15
// minutes without re-proving 2FA, and the app's silent refresh (see
// lib/apiClient.ts) can keep a session alive far longer than that in
// practice. For the platform's most consequential actions — moving money
// out of the bond fund — that's not enough. This requires a *fresh* TOTP
// code on the request itself, checked independently of whatever the JWT
// says, every single time.
export async function requireStepUpTotp(
  user: BaseUser,
  totpCode: string | undefined
): Promise<{ ok: true } | { error: NextResponse }> {
  if (!user.totpSecret) {
    return {
      error: NextResponse.json({ error: "2fa_not_provisioned_contact_super_admin" }, { status: 403 }),
    };
  }
  if (!totpCode) {
    return {
      error: NextResponse.json({ error: "step_up_totp_required", requiresTotp: true }, { status: 401 }),
    };
  }
  const result = await verifyTotp({ secret: user.totpSecret, token: totpCode });
  if (!result.valid) {
    return { error: NextResponse.json({ error: "invalid_totp_code" }, { status: 401 }) };
  }
  return { ok: true };
}
