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
