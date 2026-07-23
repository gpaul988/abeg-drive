import { MarketingShell, PageHeader } from "@/components/MarketingShell";

const FAQS = [
  {
    q: "Do I ride in my own car, or a driver's car?",
    a: "Your own car. Our primary driver takes the wheel of your vehicle and drives it — and you — to your destination. An escort driver accompanies separately and returns the primary driver to base afterward.",
  },
  {
    q: "Why do I need to verify my identity before booking?",
    a: "Mandatory NIN verification, selfie liveness, and a card on file remove anonymity from every booking — one of the most effective protections against fake bookings and robbery setups, based on the specific risks of dispatching drivers to unfamiliar addresses at night.",
  },
  {
    q: "What if I don't have a car — can I still book a ride?",
    a: "Not yet. AbegDrive is built specifically around driving your own vehicle home. If you need a ride without a car, a standard rideshare app is the better fit for now.",
  },
  {
    q: "Is my car insured during the trip?",
    a: "A formal insurtech partnership isn't in place yet. A percentage of every fare funds a bond fund — a reserve our operations team can draw on for covered incidents while we work toward full underwriting. See our Safety page for the full detail.",
  },
  {
    q: "Can I request a specific driver?",
    a: "Not currently — drivers are matched based on proximity, your vehicle's transmission type, and driver availability. Ratings and driver history factor into future matching improvements.",
  },
  {
    q: "What areas do you cover?",
    a: "Port Harcourt only, for now. Multi-city expansion is planned once our driver pool, insurance mechanism, and security partnerships are proven here first.",
  },
  {
    q: "How does the two-driver model affect my fare?",
    a: "The escort driver is included in every fare as a fixed amount — never a separate charge you opt into or out of. See our Pricing page for the full breakdown.",
  },
  {
    q: "What happens if I need to cancel?",
    a: "You can cancel from your trip screen at any point before completion. Repeated late cancellations affect your trust score, which venues, drivers, and our operations team can see.",
  },
  {
    q: "How do I become a driver?",
    a: "Apply at the driver sign-up page. You'll need a valid license, NIN and BVN, a guarantor reference, and to consent to a background check. Every application is manually reviewed — nothing is auto-approved.",
  },
  {
    q: "What if something goes wrong during a trip?",
    a: "Use the panic button on your tracking screen — it alerts our security response team immediately. You can also call our 24/7 emergency hotline directly at any time.",
  },
];

export default function FaqPage() {
  return (
    <MarketingShell>
      <PageHeader eyebrow="FAQ" title="Questions people actually ask us." />

      <div className="max-w-3xl mx-auto px-4 pb-20">
        <div className="space-y-4">
          {FAQS.map((item) => (
            <details key={item.q} className="group bg-ink-900 border border-ink-border rounded-xl p-5">
              <summary className="font-display font-medium text-paper cursor-pointer list-none flex items-center justify-between">
                {item.q}
                <span className="text-paper-faint group-open:rotate-45 transition-transform text-xl leading-none">
                  +
                </span>
              </summary>
              <p className="text-sm text-paper-dim leading-relaxed mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
