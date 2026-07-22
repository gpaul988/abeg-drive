import { NextResponse } from "next/server";
import { requireRole } from "@/lib/requireRole";
import { listDriverProfiles } from "@/lib/repositories/driverRepository";
import { findUserById } from "@/lib/repositories/userRepository";

export async function GET(req: Request) {
  const auth = await requireRole(req, ["platform_admin", "super_admin"]);
  if ("error" in auth) return auth.error;

  const allDrivers = await listDriverProfiles();
  const pending = allDrivers.filter((d) => d.applicationStatus === "under_review");

  const queue = await Promise.all(
    pending.map(async (profile) => {
      const user = await findUserById(profile.userId);
      return {
        userId: profile.userId,
        email: user?.email,
        phone: user?.phone,
        ninOnFile: Boolean(user?.ninNumber),
        bvnOnFile: Boolean(user?.bvnNumber),
        licenseNumber: profile.licenseNumber,
        licenseExpiry: profile.licenseExpiry,
        guarantor: profile.guarantor,
        vehicleCompetency: profile.vehicleCompetency,
        backgroundCheckStatus: profile.backgroundCheckStatus,
        submittedAt: profile.backgroundCheckConsentAt ?? profile.createdAt,
      };
    })
  );

  return NextResponse.json({ queue });
}
