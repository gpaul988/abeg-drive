"use client";

import { useState } from "react";
import { MarketingShell } from "@/components/MarketingShell";
import { PartnershipModal } from "@/components/PartnershipModal";

const BENEFITS = [
  {
    title: "A safety amenity your guests remember",
    body: "Offer a vetted, tracked ride home directly from your front desk — a tangible safety touch that sets your venue apart.",
  },
  {
    title: "Book on their behalf, in seconds",
    body: "Request a driver for a guest without them needing their own AbegDrive account — you handle it, we handle the rest.",
  },
  {
    title: "No cost to list",
    body: "Becoming a whitelisted venue partner is free. Guests pay the standard fare directly; you're never billed for their rides.",
  },
];

const STEPS = [
  { n: "01", title: "Apply", body: "Tell us about your venue — takes about two minutes." },
  { n: "02", title: "Get whitelisted", body: "Our ops team reviews new venues, usually within a couple of business days." },
  { n: "03", title: "Request rides", body: "From your dashboard, request a driver for any guest, any time." },
];

export default function PartnersMarketingPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <MarketingShell>
      <section className="relative overflow-hidden border-b border-ink-border">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] -translate-y-1/3 translate-x-1/4"
        >
          <div className="absolute inset-0 rounded-full border border-teal/10" />
          <div className="absolute inset-[70px] rounded-full border border-teal/10" />
        </div>

        <div className="max-w-3xl mx-auto px-4 py-20 text-center relative">
          <p className="text-teal-strong text-sm font-mono mb-3 tracking-wide">VENUE PARTNERS</p>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold text-paper mb-5 tracking-tight leading-[1.05]">
            Send your guests home safely. It starts at your front desk.
          </h1>
          <p className="text-lg text-paper-dim max-w-xl mx-auto mb-8 leading-relaxed">
            Hotels, event centers, lounges, and bars — request a vetted, tracked driver for any guest, on the spot,
            no app download required on their end.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-amber hover:bg-amber-strong text-ink-950 px-6 py-3 rounded-lg font-semibold shadow-[0_0_0_1px_rgba(245,166,35,0.35),0_4px_16px_-4px_rgba(245,166,35,0.5)]"
          >
            Become a partner
          </button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 border-b border-ink-border">
        <div className="grid sm:grid-cols-3 gap-5">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-ink-900 border border-ink-border rounded-xl p-5">
              <h2 className="font-display font-medium text-paper mb-2">{b.title}</h2>
              <p className="text-sm text-paper-dim leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <p className="text-amber text-sm font-mono mb-2 tracking-wide">HOW PARTNERSHIP WORKS</p>
        <h2 className="text-3xl font-display font-semibold text-paper mb-10 tracking-tight">
          Three steps to whitelisted.
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.n}>
              <p className="font-mono text-sm text-paper-faint mb-3">{s.n}</p>
              <h3 className="font-display font-semibold text-paper mb-2">{s.title}</h3>
              <p className="text-sm text-paper-dim leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 bg-ink-900 border border-ink-border rounded-xl p-6 text-center">
          <p className="text-paper font-display font-medium mb-2">Ready to apply?</p>
          <p className="text-sm text-paper-dim mb-4">Takes about two minutes — no cost to list your venue.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-amber hover:bg-amber-strong text-ink-950 px-6 py-2.5 rounded-lg font-semibold"
          >
            Become a partner
          </button>
        </div>
      </section>

      <PartnershipModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </MarketingShell>
  );
}
