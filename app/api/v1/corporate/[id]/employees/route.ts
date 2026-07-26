import { NextResponse } from "next/server";
import { z } from "zod";
import { strongPasswordSchema } from "@/lib/validation";
import { requireUser } from "@/lib/requireAuth";
import { loadCorporateAccountForUser } from "@/lib/corporateAccess";
import {
  addEmployeeToCorporateAccount,
  removeEmployeeFromCorporateAccount,
} from "@/lib/repositories/corporateRepository";
import { findUserById, createUser, findUserByEmail, storeRefreshToken } from "@/lib/repositories/userRepository";
import { hashPassword, generateRefreshToken, REFRESH_TOKEN_TTL } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const result = await loadCorporateAccountForUser(id, auth.user);
  if ("error" in result) return result.error;

  const employees = await Promise.all(
    result.account.employeeUserIds.map(async (userId) => {
      const u = await findUserById(userId);
      return { userId, email: u?.email, phone: u?.phone };
    })
  );

  return NextResponse.json({ employees, spendLimitPerTrip: result.account.spendLimitPerTrip });
}

const addEmployeeSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),
  password: strongPasswordSchema,
});

// Adds a new employee: creates a customer-role user tied to the corporate
// account (their trips can be billed to the company) and links it. In
// production the employee would receive an invite email to set their own
// password rather than the corporate admin choosing one.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const result = await loadCorporateAccountForUser(id, auth.user);
  if ("error" in result) return result.error;

  const body = await req.json().catch(() => null);
  const parsed = addEmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  let employeeUser = await findUserByEmail(parsed.data.email);
  if (!employeeUser) {
    const passwordHash = await hashPassword(parsed.data.password);
    employeeUser = await createUser({
      phone: parsed.data.phone,
      email: parsed.data.email,
      passwordHash,
      role: "customer",
    });
    // Give the new employee a refresh token so they can log in immediately;
    // they'll still need OTP/NIN/selfie/payment-method before their first
    // booking, same as any other customer.
    await storeRefreshToken(generateRefreshToken(), employeeUser.id, REFRESH_TOKEN_TTL);
  }

  const updated = await addEmployeeToCorporateAccount(id, employeeUser.id);
  return NextResponse.json({ account: updated }, { status: 201 });
}

const removeEmployeeSchema = z.object({ userId: z.string().uuid() });

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const result = await loadCorporateAccountForUser(id, auth.user);
  if ("error" in result) return result.error;

  const body = await req.json().catch(() => null);
  const parsed = removeEmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }

  const updated = await removeEmployeeFromCorporateAccount(id, parsed.data.userId);
  return NextResponse.json({ account: updated });
}
