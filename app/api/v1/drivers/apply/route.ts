import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { driverApplySchema } from "@/lib/validation";
import { createDriverProfile, getDriverProfile, updateDriverProfile } from "@/lib/repositories/driverRepository";

export async function POST(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user } = auth;

  if (user.role !== "driver") {
    return NextResponse.json({ error: "driver_role_required" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = driverApplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await getDriverProfile(user.id);
  const profile = existing
    ? await updateDriverProfile(user.id, {
        vehicleCompetency: parsed.data.vehicleCompetency,
        applicationStatus: "documents_pending",
      })
    : await (async () => {
        const created = await createDriverProfile(user.id);
        return updateDriverProfile(user.id, {
          vehicleCompetency: parsed.data.vehicleCompetency,
          applicationStatus: "documents_pending",
        });
      })();

  return NextResponse.json({ profile, nextStep: "documents" }, { status: 201 });
}
