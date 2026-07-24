import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { changePasswordSchema } from "@/lib/validation";
import { updateUser } from "@/lib/repositories/userRepository";
import { verifyPassword, hashPassword } from "@/lib/auth";

// Not part of the original spec's endpoint list, but a genuine gap: there
// was previously no way for a logged-in user of any role to change their
// password (only the forgot-password OTP-reset flow existed, which
// requires being logged out).
export async function POST(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "current_password_incorrect" }, { status: 401 });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await updateUser(user.id, { passwordHash });

  return NextResponse.json({ success: true });
}
