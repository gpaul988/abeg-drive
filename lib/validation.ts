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
  // Must be a real captured image (data URL from canvas.toDataURL, or a
  // raw base64 payload from a native camera capture) — not an arbitrary
  // placeholder string. A genuine JPEG/PNG frame from a device camera is
  // reliably several KB at minimum; 2000 chars is a conservative floor
  // that rejects trivial fake strings while accepting real captures.
  selfieImageBase64: z
    .string()
    .min(2000, "This doesn't look like a real photo — please retake your selfie")
    .refine(
      (val) => val.startsWith("data:image/") || /^[A-Za-z0-9+/=]+$/.test(val),
      "Please provide a valid image capture"
    ),
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

// --- Contact ---

export const contactMessageSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email(),
  phone: z.string().regex(phoneRegex, "Enter a valid Nigerian phone number").optional().or(z.literal("")),
  category: z.enum(["general", "support", "press", "partnership", "safety_concern"]),
  message: z.string().min(10, "Tell us a bit more — at least 10 characters").max(2000),
});

export const contactMessageUpdateSchema = z.object({
  status: z.enum(["new", "in_progress", "resolved"]).optional(),
  adminNotes: z.string().max(1000).optional(),
});

// --- Account security ---

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});
