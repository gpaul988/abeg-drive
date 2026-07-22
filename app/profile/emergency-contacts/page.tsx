"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Button, Card, ErrorBanner, Field, SuccessBanner, TextInput } from "@/components/ui";
import { apiGet, apiPost, getSession } from "@/lib/apiClient";
import { customerNavLinks } from "@/lib/navLinks";

interface Contact {
  name: string;
  phone: string;
  relationship: string;
}

export default function EmergencyContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function load() {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    apiGet<{ emergencyContacts: Contact[] }>("/customers/me/emergency-contacts", session.accessToken).then(
      ({ status, data }) => {
        if (status === 200) setContacts(data.emergencyContacts);
      }
    );
  }

  useEffect(load, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const session = getSession()!;
    const { status, data } = await apiPost<{ error?: string }>(
      "/customers/me/emergency-contacts",
      { name, phone, relationship },
      session.accessToken
    );
    setLoading(false);
    if (status !== 201) {
      setError(
        data.error === "validation_error"
          ? "Please check the name, phone, and relationship fields."
          : "Something went wrong. Please try again."
      );
      return;
    }
    setSuccess("Emergency contact added.");
    setName("");
    setPhone("");
    setRelationship("");
    load();
  }

  return (
    <AppShell navLinks={customerNavLinks} activeHref="/profile" roleLabel="Customer">
      <a href="/profile" className="text-sm text-neutral-500 mb-4 inline-block">
        ← Back to profile
      </a>
      <h1 className="text-xl font-semibold text-neutral-900 mb-2">Emergency contacts</h1>
      <p className="text-sm text-neutral-500 mb-6">
        These contacts are notified if you share a trip or if an incident is reported. At least one is required
        before your first booking.
      </p>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <Card className="mb-6">
        <form onSubmit={onSubmit}>
          <Field label="Full name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
          </Field>
          <Field label="Phone number">
            <TextInput
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="080XXXXXXXX"
              required
            />
          </Field>
          <Field label="Relationship">
            <TextInput
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="Sister, spouse, friend…"
              required
            />
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            Add contact
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        {contacts?.map((c, i) => (
          <Card key={i}>
            <p className="font-medium text-neutral-900">{c.name}</p>
            <p className="text-sm text-neutral-500">
              {c.phone} · {c.relationship}
            </p>
          </Card>
        ))}
        {contacts && contacts.length === 0 && (
          <p className="text-sm text-neutral-400">No emergency contacts added yet.</p>
        )}
      </div>
    </AppShell>
  );
}
