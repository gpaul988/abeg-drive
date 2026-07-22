import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireAuth";
import { vehicleSchema } from "@/lib/validation";
import { addVehicleToProfile, getCustomerProfile } from "@/lib/repositories/userRepository";

export async function GET(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const profile = await getCustomerProfile(auth.user.id);
  return NextResponse.json({ vehicles: profile?.savedVehicles ?? [] });
}

export async function POST(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  if (auth.user.role !== "customer") {
    return NextResponse.json({ error: "customer_role_required" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = vehicleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const profile = await addVehicleToProfile(auth.user.id, parsed.data);
  return NextResponse.json({ vehicles: profile?.savedVehicles ?? [] }, { status: 201 });
}
