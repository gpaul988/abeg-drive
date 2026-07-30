"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, ErrorBanner, PrimaryButton, TextField } from "@/components/AuthShell";
import { apiPost, getSignupState, saveSession } from "@/lib/apiClient";

export default function PaymentMethodPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const state = getSignupState();
    if (!state) {
      router.replace("/signup");
      return;
    }
    setUserId(state.userId);
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const tokenRes = await apiPost<{ accessToken: string; refreshToken: string; error?: string }>(
      "/auth/onboarding-token",
      { userId }
    );
    if (tokenRes.status !== 200) {
      setLoading(false);
      setError("Your identity verification isn't complete yet. Please restart signup.");
      return;
    }

    const { status, data } = await apiPost<{ token: string; last4: string; error?: string }>(
      "/customers/me/payment-methods",
      { cardNumber, expiry, cvv },
      tokenRes.data.accessToken
    );
    setLoading(false);
    if (status !== 200) {
      setError("We couldn't save that card. Please check the details and try again.");
      return;
    }

    saveSession({
      userId,
      accessToken: tokenRes.data.accessToken,
      refreshToken: tokenRes.data.refreshToken,
      role: "customer",
    });
    router.push("/dashboard");
  }

  return (
    <AuthShell
      step={5}
      totalSteps={5}
      title="Add a payment method"
      subtitle="Required before your first booking — no cash-only anonymous bookings, for everyone's safety"
    >
      <form onSubmit={onSubmit}>
        <ErrorBanner message={error} />
        <TextField
          label="Card number"
          inputMode="numeric"
          placeholder="4084 0840 8408 4081"
          required
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ""))}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Expiry"
            placeholder="MM/YY"
            required
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
          <TextField
            label="CVV"
            inputMode="numeric"
            maxLength={4}
            placeholder="123"
            required
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <PrimaryButton type="submit" loading={loading}>
          Finish setup
        </PrimaryButton>
        <p className="text-xs text-paper-faint text-center mt-4">
          Secured via Paystack. Dev mode uses a mock tokenizer — no real card data is sent anywhere.
        </p>
      </form>
    </AuthShell>
  );
}
