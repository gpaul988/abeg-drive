"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Button, Card, ErrorBanner, Field, SuccessBanner, TextArea, TextInput } from "@/components/ui";
import { apiGet, apiPost, getSession } from "@/lib/apiClient";
import { customerNavLinks } from "@/lib/navLinks";

interface Me {
  email: string;
  phone: string;
}

export default function SupportPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<Me>("/customers/me", session.accessToken).then(({ status, data }) => {
      if (status === 200) {
        setEmail(data.email);
        setPhone(data.phone);
      }
    });
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<{ error?: string }>("/contact", {
      name: name || email.split("@")[0],
      email,
      phone,
      category: "support",
      message,
    });
    setLoading(false);
    if (status !== 201) {
      setError(
        data.error === "validation_error"
          ? "Please check your details — your message needs at least 10 characters."
          : "Something went wrong sending your message. Please try again."
      );
      return;
    }
    setSubmitted(true);
    setMessage("");
  }

  return (
    <AppShell navLinks={customerNavLinks} activeHref="/support" roleLabel="Customer">
      <h1 className="text-xl font-semibold text-paper mb-6">Support</h1>

      <Card className="mb-6 bg-danger/10 border-danger/30">
        <p className="text-sm font-medium text-danger-strong mb-1">In an emergency during a trip?</p>
        <p className="text-sm text-danger-strong mb-3">
          Use the panic button on your trip tracking screen first — it alerts our security response team
          immediately. You can also call our 24/7 emergency hotline directly:
        </p>
        <a href="tel:+2348000000000" className="text-lg font-semibold text-danger-strong">
          +234 800 000 0000
        </a>
      </Card>

      <ErrorBanner message={error} />
      <SuccessBanner
        message={submitted ? "Your message was sent. Our team will respond by phone or email shortly." : null}
      />

      <Card>
        <h2 className="font-medium text-paper mb-4">Send us a message</h2>
        <form onSubmit={onSubmit}>
          <Field label="Your name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder={email.split("@")[0]} />
          </Field>
          <Field label="Message">
            <TextArea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required minLength={10} />
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            Send message
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
