import { GeoPoint } from "./types";
import { distanceKm } from "./geo";
import { getPricingConfig } from "./repositories/pricingRepository";

export interface FareBreakdown {
  baseFare: number;
  distanceKm: number;
  distanceFare: number;
  escortSurcharge: number;
  surgeApplied: boolean;
  subtotal: number;
  total: number;
}

// Fare model reads live rates from admin/pricing (lib/repositories/pricingRepository.ts)
// rather than hardcoded constants, so Platform Admin's fare-rule changes take
// effect immediately without a deploy. Distance is a straight-line Haversine
// estimate until a real distance/duration matrix (Google Directions API) is
// wired up in production — real road distance in Port Harcourt traffic will
// run higher than this estimate.
export async function estimateFare(pickup: GeoPoint, stops: GeoPoint[]): Promise<FareBreakdown> {
  const config = await getPricingConfig();

  let totalDistance = 0;
  let prev = pickup;
  for (const stop of stops) {
    totalDistance += distanceKm(prev, stop);
    prev = stop;
  }
  const distanceFare = Math.round(totalDistance * config.perKmRate);
  const subtotal = config.baseFare + distanceFare + config.escortSurcharge;
  const total = config.surgeEnabled ? Math.round(subtotal * config.surgeMultiplier) : subtotal;

  return {
    baseFare: config.baseFare,
    distanceKm: Math.round(totalDistance * 10) / 10,
    distanceFare,
    escortSurcharge: config.escortSurcharge,
    surgeApplied: config.surgeEnabled,
    subtotal,
    total,
  };
}
