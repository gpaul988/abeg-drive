import { NextResponse } from "next/server";
import { contactMessageSchema } from "@/lib/validation";
import { createContactMessage } from "@/lib/repositories/contactRepository";
import { enforceRateLimit } from "@/lib/rateLimit";

// Public, unauthenticated — this is the front door for anyone reaching out
// (press, prospective partners, safety concerns, general support) before
// they necessarily have an account. Routes into the admin contact-messages
// inbox for triage.
export async function POST(req: Request) {
  // Prevents the public contact form from being used as a spam vector.
  const rateLimitResponse = enforceRateLimit(req, "contact", 5, 15 * 60 * 1000);
  if (rateLimitResponse) return rateLimitResponse;

  const body = await req.json().catch(() => null);
  const parsed = contactMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const message = await createContactMessage({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || undefined,
    category: parsed.data.category,
    message: parsed.data.message,
  });

  return NextResponse.json({ id: message.id, received: true }, { status: 201 });
}
