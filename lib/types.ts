// Core domain types for AbegDrive.
// These mirror the data model in the spec. Only auth-relevant fields are
// actively used by this module; trip/driver/admin fields are included now
// so later modules (trips, admin) extend the same shapes without migration.

export type UserRole =
  | "customer"
  | "driver"
  | "corporate_admin"
  | "venue_partner"
  | "platform_admin"
  | "security_agent"
  | "super_admin";

export type VerificationStatus = "pending" | "verified" | "rejected";

export interface BaseUser {
  id: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;

  // Identity (encrypted-at-rest in production via KMS/column-level encryption;
  // stored plain in this dev store, see lib/db.ts note)
  ninNumber?: string;
  bvnNumber?: string;
  verificationStatus: VerificationStatus;
  selfieLivenessRef?: string;

  // Signup funnel progress — used to gate booking until all steps complete
  otpVerifiedAt?: string;
  identityVerifiedAt?: string;
  paymentMethodAddedAt?: string;

  // 2FA (TOTP) — mandatory for platform_admin/security_agent/super_admin
  // roles per spec section 3.7 and 5. Not applicable to customer/driver.
  totpSecret?: string;
  totpEnabledAt?: string;
}

export interface CustomerProfile {
  userId: string;
  emergencyContacts: EmergencyContact[];
  savedVehicles: Vehicle[];
  paymentMethodToken?: string;
  trustScore: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Vehicle {
  make: string;
  model: string;
  plateNumber: string;
  transmissionType: "manual" | "automatic";
}

export interface OtpRecord {
  phone: string;
  code: string;
  expiresAt: string;
  consumedAt?: string;
}

export interface RefreshTokenRecord {
  token: string;
  userId: string;
  expiresAt: string;
  revokedAt?: string;
}

// --- Driver ---

export type VehicleCompetency = "manual" | "automatic" | "suv" | "sedan" | "motorcycle";
export type ProbationStatus = "in_probation" | "graduated" | "suspended";
export type BackgroundCheckStatus = "not_started" | "pending" | "cleared" | "flagged";
export type DriverAvailability = "offline" | "online" | "on_trip";
export type DriverApplicationStatus =
  | "submitted"
  | "documents_pending"
  | "under_review"
  | "approved"
  | "rejected";

export interface Guarantor {
  name: string;
  phone: string;
  relationship: string;
}

export interface DriverProfile {
  userId: string;
  applicationStatus: DriverApplicationStatus;

  licenseNumber?: string;
  licenseExpiry?: string;
  licenseDocRef?: string;

  guarantor?: Guarantor;

  addressVerified: boolean;
  addressVisitScheduledAt?: string;

  backgroundCheckStatus: BackgroundCheckStatus;
  backgroundCheckConsentAt?: string;

  bankPayoutSubaccountId?: string;

  vehicleCompetency: VehicleCompetency[];

  // Probation: first N trips are ops-monitored before full graduation
  probationStatus: ProbationStatus;
  tripsCompleted: number;
  probationTripsRequired: number;

  ratingAvg: number;
  ratingCount: number;

  availability: DriverAvailability;
  currentLocation?: GeoPoint;
  lastLocationPingAt?: string;

  trainingModulesCompleted: string[];

  createdAt: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

// --- Trip ---

export type TripStatus =
  | "requested"
  | "matched"
  | "en_route"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "incident";

export type PaymentStatus = "pending" | "authorized" | "captured" | "failed" | "refunded";

export interface TripLocation {
  label: string;
  address: string;
  point: GeoPoint;
}

export interface VehicleSnapshot {
  make: string;
  model: string;
  plateNumber: string;
  transmissionType: "manual" | "automatic";
}

export interface LocationPing {
  point: GeoPoint;
  timestamp: string;
  reportedBy: "driver_primary" | "driver_escort";
}

export interface Trip {
  id: string;
  customerId: string;
  driverPrimaryId?: string;
  driverEscortId?: string;

  // Set when a Venue Partner books on behalf of a guest who may not have
  // their own AbegDrive account (spec section 3.6 / API section 5). In
  // that case customerId is the venue partner's own user id (so existing
  // access-control and rating logic keeps working unmodified) and these
  // fields carry the actual rider's details.
  requestedByVenueId?: string;
  guestName?: string;
  guestPhone?: string;

  pickup: TripLocation;
  destinations: TripLocation[]; // multi-stop supported, in order
  scheduledTime?: string; // undefined = "now"

  vehicleSnapshot: VehicleSnapshot;

  status: TripStatus;

  fareEstimate: number;
  fareFinal?: number;
  paymentStatus: PaymentStatus;
  paymentReference?: string;

  livelocationPings: LocationPing[];
  shareTripLinkToken?: string;

  startSelfieMatchResult?: boolean;

  ratingCustomerToDriver?: number;
  ratingDriverToCustomer?: number;
  ratingComment?: string;

  createdAt: string;
  matchedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

// --- Incident ---

export type IncidentType = "panic" | "accident" | "dispute" | "no_show";
export type IncidentStatus = "open" | "investigating" | "resolved";

export interface Incident {
  id: string;
  tripId: string;
  triggeredBy: "customer" | "driver";
  type: IncidentType;
  status: IncidentStatus;
  resolutionNotes?: string;
  escalatedToSecurityPartner: boolean;
  assignedSecurityAgentId?: string;
  createdAt: string;
  resolvedAt?: string;
}

// --- Bond fund ---

export interface BondFundLedgerEntry {
  id: string;
  tripId: string;
  contributionAmount: number;
  runningBalance: number;
  claimId?: string;
  createdAt: string;
}

// --- Corporate / Venue ---

export interface CorporateAccount {
  id: string;
  ownerUserId: string; // the corporate_admin user who manages this account
  companyName: string;
  rcNumber: string;
  billingContact: string;
  employeeUserIds: string[];
  spendLimitPerTrip?: number;
  allowedHoursStart?: string;
  allowedHoursEnd?: string;
  createdAt: string;
}

export interface VenuePartner {
  id: string;
  ownerUserId: string;
  venueName: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  whitelisted: boolean;
  createdAt: string;
}

// --- Contact messages ---

export type ContactCategory = "general" | "support" | "press" | "partnership" | "safety_concern";
export type ContactMessageStatus = "new" | "in_progress" | "resolved";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: ContactCategory;
  message: string;
  status: ContactMessageStatus;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}
