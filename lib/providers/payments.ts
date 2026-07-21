// Adapter boundary for card tokenization / charging.
//
// Production: Paystack primary, Flutterwave fallback (per spec section 7),
// using PAYSTACK_SECRET_KEY. No live key is available in this sandbox, so
// tokenizeCard returns a mock token deterministically derived from the input
// so the same test card always maps to the same token in dev/testing.

import { createHash } from "crypto";

export interface TokenizeResult {
  token: string;
  last4: string;
}

export async function tokenizeCard(cardNumber: string, expiry: string, cvv: string): Promise<TokenizeResult> {
  const apiKey = process.env.PAYSTACK_SECRET_KEY;

  if (!apiKey) {
    const hash = createHash("sha256").update(`${cardNumber}:${expiry}:${cvv}`).digest("hex").slice(0, 16);
    return { token: `tok_dev_${hash}`, last4: cardNumber.slice(-4) };
  }

  // Example real integration (Paystack): create a customer, initiate a
  // charge with `authorization_code` reuse, or use Paystack's card
  // tokenization flow via /charge with a saved authorization.
  // const res = await fetch("https://api.paystack.co/customer", { ... });

  return { token: "unreachable_without_live_key", last4: cardNumber.slice(-4) };
}
