import { z } from "zod";

// Nigerian phone numbers: +234XXXXXXXXXX or 0XXXXXXXXXX
const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;

export const signupSchema = z.object({
  phone: z.string().regex(phoneRegex, "Enter a valid Nigerian phone number"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["customer", "driver"]).default("customer"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(phoneRegex),
  code: z.string().length(6),
});

export const loginSchema = z.object({
  identifier: z.string().min(3), // phone or email
  password: z.string().min(1),
  totpCode: z.string().length(6).optional(),
});

export const ninVerifySchema = z.object({
  userId: z.string().uuid(),
  ninNumber: z.string().length(11, "NIN must be 11 digits"),
});

export const selfieLivenessSchema = z.object({
  userId: z.string().uuid(),
  // In production this is a multipart image upload routed to Prembly/
  // Smile Identity. For MVP we accept a base64 placeholder reference.
  selfieImageBase64: z.string().min(10),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10),
});

// --- Customer profile ---

export const vehicleSchema = z.object({
  make: z.string().min(1, "Vehicle make is required"),
  model: z.string().min(1, "Vehicle model is required"),
  plateNumber: z
    .string()
    .min(4, "Enter a valid plate number")
    .max(12)
    .regex(/^[A-Z0-9\- ]+$/i, "Plate number may only contain letters, numbers, spaces, and hyphens"),
  transmissionType: z.enum(["manual", "automatic"]),
});

export const emergencyContactSchema = z.object({
  name: z.string().min(2, "Enter the contact's full name"),
  phone: z.string().regex(phoneRegex, "Enter a valid Nigerian phone number"),
  relationship: z.string().min(2, "Enter your relationship to this contact"),
});

// --- Trips ---

const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const tripLocationSchema = z.object({
  label: z.string().min(1),
  address: z.string().min(3, "Enter a valid address"),
  point: geoPointSchema,
});

export const createTripSchema = z.object({
  pickup: tripLocationSchema,
  destinations: z.array(tripLocationSchema).min(1, "At least one destination is required").max(5, "Maximum 5 stops"),
  vehicle: vehicleSchema,
  scheduledTime: z.string().datetime().optional(),
});

export const panicSchema = z.object({
  triggeredBy: z.enum(["customer", "driver"]),
});

export const rateTripSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  direction: z.enum(["customer_to_driver", "driver_to_customer"]),
});

export const cancelTripSchema = z.object({
  reason: z.string().min(3, "Please tell us why you're cancelling").max(300),
});

export const locationPingSchema = z.object({
  point: geoPointSchema,
});

// --- Driver onboarding ---

export const driverApplySchema = z.object({
  vehicleCompetency: z
    .array(z.enum(["manual", "automatic", "suv", "sedan", "motorcycle"]))
    .min(1, "Select at least one vehicle competency"),
});

export const driverDocumentsSchema = z.object({
  bvnNumber: z.string().length(11, "BVN must be 11 digits"),
  licenseNumber: z.string().min(5, "Enter a valid license number"),
  licenseExpiry: z.string().datetime(),
  guarantorName: z.string().min(2),
  guarantorPhone: z.string().regex(phoneRegex, "Enter a valid Nigerian phone number"),
  guarantorRelationship: z.string().min(2),
  backgroundCheckConsent: z.literal(true, {
    error: "You must consent to a background check to continue",
  }),
});

export const availabilitySchema = z.object({
  availability: z.enum(["offline", "online"]),
});
