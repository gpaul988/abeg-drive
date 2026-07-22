import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/requireAuth";
import { estimateFare } from "@/lib/fareEstimator";

// Not part of the original spec's endpoint list, but required to render
// booking Step 4 ("fare estimate + confirm") without creating a Trip record
// for every keystroke of the pickup/destination pickers. POST /trips itself
// still returns the authoritative fare estimate at creation time.
const geoPointSchema = z.object({ lat: z.number(), lng: z.number() });
const schema = z.object({
  pickup: geoPointSchema,
  destinations: z.array(geoPointSchema).min(1).max(5),
});

export async function POST(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const breakdown = estimateFare(parsed.data.pickup, parsed.data.destinations);
  return NextResponse.json({ fareBreakdown: breakdown });
}
