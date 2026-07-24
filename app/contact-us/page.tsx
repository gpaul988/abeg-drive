"use client";

import { useState } from "react";
import { MarketingShell, PageHeader } from "@/components/MarketingShell";
import { apiPost } from "@/lib/apiClient";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "general", label: "General inquiry" },
  { value: "support", label: "Trip or account support" },
  { value: "partnership", label: "Venue or corporate partnership" },
  { value: "press", label: "Press & media" },
  { value: "safety_concern", label: "Safety concern" },
];

export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<{ error?: string }>("/contact", {
      name,
      email,
      phone: phone || undefined,
      category,
      message,
    });
    setLoading(false);
    if (status !== 201) {
      setError(
        data.error === "validation_error"
          ? "Please check your details — every field except phone is required, and your message needs at least 10 characters."
          : "Something went wrong sending your message. Please try again."
      );
      return;
    }
    setSubmitted(true);
  }

  return (
    <MarketingShell>
      <PageHeader
        eyebrow="CONTACT US"
        title="Talk to a real person."
        subtitle="Whether it's a question, a partnership idea, press, or a safety concern — this reaches our team directly."
      />

      <div className="max-w-3xl mx-auto px-4 pb-20 grid sm:grid-cols-5 gap-8">
        <div className="sm:col-span-2 space-y-5">
          <div className="bg-ink-900 border border-ink-border rounded-xl p-5">
            <p className="text-sm text-paper-faint mb-1">Emergency hotline</p>
            <a href="tel:+2348000000000" className="font-display font-semibold text-danger-strong text-lg">
              +234 800 000 0000
            </a>
            <p className="text-xs text-paper-faint mt-1">24/7, for active trip emergencies</p>
          </div>
          <div className="bg-ink-900 border border-ink-border rounded-xl p-5">
            <p className="text-sm text-paper-faint mb-1">General support</p>
            <a href="mailto:hello@abegdrive.ng" className="font-medium text-paper">
              hello@abegdrive.ng
            </a>
          </div>
          <div className="bg-ink-900 border border-ink-border rounded-xl p-5">
            <p className="text-sm text-paper-faint mb-1">Office</p>
            <p className="text-paper text-sm leading-relaxed">
              Port Harcourt, Rivers State
              <br />
              Nigeria
            </p>
          </div>
        </div>

        <div className="sm:col-span-3">
          {submitted ? (
            <div className="bg-ink-900 border border-ink-border rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal/10 border border-teal/30 mb-4">
                <span className="radar-dot text-teal" />
              </div>
              <h2 className="font-display font-semibold text-paper text-lg mb-2">Message sent</h2>
              <p className="text-sm text-paper-dim">
                Thanks for reaching out — our team typically responds within one business day.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="bg-ink-900 border border-ink-border rounded-xl p-6">
              {error && (
                <div className="mb-4 text-sm text-danger-strong bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <label className="block mb-4">
                  <span className="block text-sm font-medium text-paper-dim mb-1.5">Full name</span>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50"
                  />
                </label>
                <label className="block mb-4">
                  <span className="block text-sm font-medium text-paper-dim mb-1.5">Phone (optional)</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="080XXXXXXXX"
                    className="w-full bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50"
                  />
                </label>
              </div>

              <label className="block mb-4">
                <span className="block text-sm font-medium text-paper-dim mb-1.5">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50"
                />
              </label>

              <label className="block mb-4">
                <span className="block text-sm font-medium text-paper-dim mb-1.5">What's this about?</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block mb-4">
                <span className="block text-sm font-medium text-paper-dim mb-1.5">Message</span>
                <textarea
                  required
                  rows={5}
                  minLength={10}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-amber hover:bg-amber-strong disabled:bg-ink-border disabled:text-paper-faint text-ink-950 transition-colors"
              >
                {loading ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </MarketingShell>
  );
}
