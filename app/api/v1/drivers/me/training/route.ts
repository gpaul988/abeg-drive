import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/requireAuth";
import { getDriverProfile, updateDriverProfile } from "@/lib/repositories/driverRepository";

const schema = z.object({ moduleId: z.string().min(1) });

export async function POST(req: Request) {
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

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }

  const completed = new Set(profile.trainingModulesCompleted);
  completed.add(parsed.data.moduleId);
  const updated = await updateDriverProfile(user.id, { trainingModulesCompleted: [...completed] });

  return NextResponse.json({ trainingModulesCompleted: updated?.trainingModulesCompleted ?? [] });
}
