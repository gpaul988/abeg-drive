import { GeoPoint } from "./types";

// Haversine distance in kilometers. Sufficient for nearest-driver ranking at
// city scale; production would use PostGIS ST_Distance for indexed queries.
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Port Harcourt city center — used as a fallback origin when a driver has no
// recorded location yet (dev/demo convenience).
export const PORT_HARCOURT_CENTER: GeoPoint = { lat: 4.8156, lng: 7.0498 };
