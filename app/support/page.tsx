"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Button, Card, Field, SuccessBanner, TextArea, TextInput } from "@/components/ui";
import { getSession } from "@/lib/apiClient";
import { customerNavLinks } from "@/lib/navLinks";

export default function SupportPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!getSession()) router.replace("/login");
  }, [router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // MVP: in-app chat is deferred per spec section 9 ("phone-based support
    // acceptable initially"). This form is a lightweight ticket intake;
    // production would route it to a helpdesk (Zendesk/Freshdesk) via
    // webhook rather than storing tickets in this dev data store.
    setSubmitted(true);
    setSubject("");
    setMessage("");
  }

  return (
    <AppShell navLinks={customerNavLinks} activeHref="/support" roleLabel="Customer">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Support</h1>

      <Card className="mb-6 bg-red-50 border-red-200">
        <p className="text-sm font-medium text-red-800 mb-1">In an emergency during a trip?</p>
        <p className="text-sm text-red-700 mb-3">
          Use the panic button on your trip tracking screen first — it alerts our security response team
          immediately. You can also call our 24/7 emergency hotline directly:
        </p>
        <a href="tel:+2348000000000" className="text-lg font-semibold text-red-800">
          +234 800 000 0000
        </a>
      </Card>

      <SuccessBanner message={submitted ? "Your message was sent. Our team will respond by phone or email shortly." : null} />

      <Card>
        <h2 className="font-medium text-neutral-900 mb-4">Send us a message</h2>
        <form onSubmit={onSubmit}>
          <Field label="Subject">
            <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </Field>
          <Field label="Message">
            <TextArea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
          </Field>
          <Button type="submit" className="w-full">
            Send message
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
