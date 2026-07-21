import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/requireAuth";
import { updateCustomerProfile, updateUser } from "@/lib/repositories/userRepository";
import { tokenizeCard } from "@/lib/providers/payments";

const schema = z.object({
  cardNumber: z.string().min(12).max(19),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/),
  cvv: z.string().min(3).max(4),
});

export async function POST(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user } = auth;

  if (user.role !== "customer") {
    return NextResponse.json({ error: "customer_role_required" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const { token, last4 } = await tokenizeCard(parsed.data.cardNumber, parsed.data.expiry, parsed.data.cvv);

  await updateCustomerProfile(user.id, { paymentMethodToken: token });
  await updateUser(user.id, { paymentMethodAddedAt: new Date().toISOString() });

  return NextResponse.json({ token, last4, nextStep: "dashboard" });
}
