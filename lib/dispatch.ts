import { findAvailableDrivers, updateDriverProfile } from "./repositories/driverRepository";
import { DriverProfile, VehicleSnapshot, GeoPoint } from "./types";
import { distanceKm, PORT_HARCOURT_CENTER } from "./geo";

export interface MatchResult {
  primary: DriverProfile;
  escort: DriverProfile;
}

// Matches a trip to a primary + escort driver pair. Primary driver must be
// competent for the customer's transmission type; escort is the next-best
// available driver, competency-agnostic (they drive the company escort
// vehicle, not the customer's car), per spec section 3.7 dispatch engine.
export async function matchDrivers(
  pickup: GeoPoint,
  vehicle: VehicleSnapshot
): Promise<MatchResult | null> {
  const available = await findAvailableDrivers();
  if (available.length < 2) return null;

  const competent = available.filter((d) => d.vehicleCompetency.includes(vehicle.transmissionType));
  if (competent.length === 0) return null;

  const ranked = competent
    .map((d) => ({
      driver: d,
      distance: distanceKm(d.currentLocation ?? PORT_HARCOURT_CENTER, pickup),
    }))
    .sort((a, b) => {
      // Graduated (non-probation) drivers are preferred for primary duty;
      // ties broken by proximity.
      if (a.driver.probationStatus !== b.driver.probationStatus) {
        return a.driver.probationStatus === "graduated" ? -1 : 1;
      }
      return a.distance - b.distance;
    });

  const primary = ranked[0]?.driver;
  if (!primary) return null;

  const escortCandidates = available
    .filter((d) => d.userId !== primary.userId)
    .map((d) => ({ driver: d, distance: distanceKm(d.currentLocation ?? PORT_HARCOURT_CENTER, pickup) }))
    .sort((a, b) => a.distance - b.distance);

  const escort = escortCandidates[0]?.driver;
  if (!escort) return null;

  await updateDriverProfile(primary.userId, { availability: "on_trip" });
  await updateDriverProfile(escort.userId, { availability: "on_trip" });

  return { primary, escort };
}
