import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { driverDocumentsSchema } from "@/lib/validation";
import { getDriverProfile, updateDriverProfile } from "@/lib/repositories/driverRepository";
import { updateUser } from "@/lib/repositories/userRepository";

export async function POST(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user } = auth;

  if (user.role !== "driver") {
    return NextResponse.json({ error: "driver_role_required" }, { status: 403 });
  }

  const existing = await getDriverProfile(user.id);
  if (!existing) {
    return NextResponse.json({ error: "driver_application_not_found" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = driverDocumentsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }
  const { bvnNumber, licenseNumber, licenseExpiry, guarantorName, guarantorPhone, guarantorRelationship } =
    parsed.data;

  // BVN sits on the base User record (alongside NIN), consistent with the
  // data model in SPEC.md section 4. NIN itself is captured earlier via the
  // shared /auth/identity/nin-verify endpoint (same one customers use).
  await updateUser(user.id, { bvnNumber });

  // MVP: FRSC database integration is deferred (per spec section 9) — this
  // routes the application into a manual verification queue instead of
  // auto-approving. Ops approves via /admin/verifications.
  const profile = await updateDriverProfile(user.id, {
    licenseNumber,
    licenseExpiry,
    guarantor: { name: guarantorName, phone: guarantorPhone, relationship: guarantorRelationship },
    backgroundCheckStatus: "pending",
    backgroundCheckConsentAt: new Date().toISOString(),
    applicationStatus: "under_review",
  });

  return NextResponse.json({ profile, nextStep: "awaiting_manual_review" });
}
