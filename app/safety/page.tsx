import Link from "next/link";
import { MarketingShell, PageHeader } from "@/components/MarketingShell";

const PILLARS = [
  {
    title: "Every driver is verified before they drive",
    body: "NIN and BVN verification, a driver's license check, a guarantor reference, and a selfie liveness match are all required before an application even reaches manual review. Nothing is auto-approved — a human reviews every driver application.",
  },
  {
    title: "Every customer is verified before their first booking",
    body: "Phone verification, NIN and selfie liveness, and a payment card on file are required before anyone can book. There's no cash-only, anonymous booking path — this is one of the most effective protections against fake bookings.",
  },
  {
    title: "A second driver is always there",
    body: "The escort driver isn't optional or occasional — it's the default operating model for every single trip. One driver is never alone with your vehicle, and you're never alone with a single unaccompanied driver either.",
  },
  {
    title: "Your trip is tracked and retained",
    body: "GPS location pings are logged for the duration of every trip and retained for twelve months for dispute resolution — useful for you, for us, and, if it's ever needed, for law enforcement.",
  },
  {
    title: "The start of every trip is verified again",
    body: "Right before a trip starts, your primary driver completes another selfie liveness check — confirming the person behind the wheel is the same person whose background we verified at onboarding.",
  },
  {
    title: "Help is one tap away",
    body: "The panic button on your tracking screen alerts our security response team immediately, targeting a response within seconds. A dedicated Security Agent team monitors active trips and incidents in real time.",
  },
];

export default function SafetyPage() {
  return (
    <MarketingShell>
      <PageHeader
        eyebrow="SAFETY"
        title="Trust isn't a feature we bolted on. It's the whole design."
        subtitle="Every safeguard below exists because a real risk analysis of the Port Harcourt market identified it — not as a checklist item, but as something that had to be true before we'd launch."
      />

      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="grid sm:grid-cols-2 gap-5">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-ink-900 border border-ink-border rounded-xl p-5">
              <h2 className="font-display font-medium text-paper mb-2">{p.title}</h2>
              <p className="text-sm text-paper-dim leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-ink-900 border border-ink-border rounded-xl p-6">
          <h2 className="font-display font-semibold text-paper text-lg mb-3">On insurance, honestly</h2>
          <p className="text-paper-dim leading-relaxed text-sm mb-3">
            A full insurtech partnership for a service like this doesn&apos;t exist yet in the Nigerian market. In the
            meantime, a small percentage of every trip fare is set aside into a bond fund — a self-funded reserve
            our operations team can draw on to make a customer or driver whole after a covered incident, while we
            work toward a formal underwriting partnership.
          </p>
          <p className="text-paper-dim leading-relaxed text-sm">
            We&apos;d rather tell you exactly how this works today than imply a level of coverage we don&apos;t yet have.
          </p>
        </div>

        <div className="mt-8 bg-danger/10 border border-danger/30 rounded-xl p-6">
          <h2 className="font-display font-semibold text-paper text-lg mb-2">In an emergency</h2>
          <p className="text-paper-dim text-sm mb-3">
            Use the panic button on your trip tracking screen first. You can also call our emergency hotline
            directly, any time:
          </p>
          <a href="tel:+2348000000000" className="text-xl font-display font-semibold text-danger-strong">
            +234 800 000 0000
          </a>
        </div>

        <div className="mt-12 text-center">
          <Link href="/how-it-works" className="text-amber-strong font-medium text-sm">
            See exactly how a trip works, step by step →
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
