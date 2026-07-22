"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Button, Card, ErrorBanner, Field, SuccessBanner, TextInput } from "@/components/ui";
import { apiGet, apiPost, getSession } from "@/lib/apiClient";
import { customerNavLinks } from "@/lib/navLinks";

interface Me {
  profile?: { paymentMethodToken?: string };
}

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [hasCard, setHasCard] = useState<boolean | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<Me>("/customers/me", session.accessToken).then(({ status, data }) => {
      if (status === 200) setHasCard(Boolean(data.profile?.paymentMethodToken));
    });
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const session = getSession()!;
    const { status } = await apiPost(
      "/customers/me/payment-methods",
      { cardNumber, expiry, cvv },
      session.accessToken
    );
    setLoading(false);
    if (status !== 200) {
      setError("Couldn't save that card. Please check the details and try again.");
      return;
    }
    setSuccess("Payment method updated.");
    setHasCard(true);
    setCardNumber("");
    setExpiry("");
    setCvv("");
  }

  return (
    <AppShell navLinks={customerNavLinks} activeHref="/payment-methods" roleLabel="Customer">
      <h1 className="text-xl font-semibold text-neutral-900 mb-2">Payment method</h1>
      <p className="text-sm text-neutral-500 mb-6">
        A card on file is required for every booking — this removes anonymity and is a core part of how we keep
        rides safe.
      </p>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {hasCard && (
        <Card className="mb-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-900">Card on file</p>
            <p className="text-sm text-neutral-500">•••• •••• •••• ••••</p>
          </div>
        </Card>
      )}

      <Card>
        <form onSubmit={onSubmit}>
          <Field label="Card number">
            <TextInput
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ""))}
              placeholder="4084 0840 8408 4081"
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiry">
              <TextInput value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" required />
            </Field>
            <Field label="CVV">
              <TextInput
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                placeholder="123"
                maxLength={4}
                required
              />
            </Field>
          </div>
          <Button type="submit" loading={loading} className="w-full">
            {hasCard ? "Update card" : "Save card"}
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
