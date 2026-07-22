import { GeoPoint } from "./types";
import { distanceKm } from "./geo";

// Placeholder fare model until a real distance/duration matrix (Google
// Directions API) and finalized pricing policy are wired up. Structure keeps
// the two-driver dispatch cost and bond fund contribution visible in the
// estimate breakdown, per spec sections 1 and 6.
const BASE_FARE = 1500; // NGN
const PER_KM_RATE = 250; // NGN
const ESCORT_SURCHARGE = 1000; // NGN — covers the second driver's return trip

export interface FareBreakdown {
  baseFare: number;
  distanceKm: number;
  distanceFare: number;
  escortSurcharge: number;
  total: number;
}

export function estimateFare(pickup: GeoPoint, stops: GeoPoint[]): FareBreakdown {
  let totalDistance = 0;
  let prev = pickup;
  for (const stop of stops) {
    totalDistance += distanceKm(prev, stop);
    prev = stop;
  }
  const distanceFare = Math.round(totalDistance * PER_KM_RATE);
  const total = BASE_FARE + distanceFare + ESCORT_SURCHARGE;

  return {
    baseFare: BASE_FARE,
    distanceKm: Math.round(totalDistance * 10) / 10,
    distanceFare,
    escortSurcharge: ESCORT_SURCHARGE,
    total,
  };
}
