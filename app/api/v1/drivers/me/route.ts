import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { getDriverProfile } from "@/lib/repositories/driverRepository";

export async function GET(req: Request) {
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

  return NextResponse.json({ profile });
}
