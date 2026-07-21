// Core domain types for SafeKeys.
// These mirror the data model in the spec. Only auth-relevant fields are
// actively used by this module; trip/driver/admin fields are included now
// so later modules (trips, admin) extend the same shapes without migration.

export type UserRole =
  | "customer"
  | "driver"
  | "corporate_admin"
  | "venue_partner"
  | "platform_admin"
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
