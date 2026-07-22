import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { availabilitySchema } from "@/lib/validation";
import { getDriverProfile, updateDriverProfile } from "@/lib/repositories/driverRepository";

export async function PUT(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user } = auth;

  if (user.role !== "driver") {
    return NextResponse.json({ error: "driver_role_required" }, { status: 403 });
  }

  const profile = await getDriverProfile(user.id);
  if (!profile) {
    return NextResponse.json({ error: "driver_application_not_found" }, { status: 404 });
  }
  if (profile.applicationStatus !== "approved") {
    return NextResponse.json({ error: "application_not_approved" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateDriverProfile(user.id, { availability: parsed.data.availability });
  return NextResponse.json({ availability: updated?.availability });
}
