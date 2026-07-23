import Link from "next/link";
import { MarketingShell, PageHeader } from "@/components/MarketingShell";

export default function PricingPage() {
  return (
    <MarketingShell>
      <PageHeader
        eyebrow="PRICING"
        title="One transparent fare. No surge by default."
        subtitle="Every fare covers both drivers on your trip — the primary driver and the escort. There's no separate line item, no surprise add-on."
      />

      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-ink-900 border border-ink-border rounded-xl p-6 mb-8">
          <h2 className="font-display font-semibold text-paper text-lg mb-4">How a fare is built</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-ink-border pb-3">
              <div>
                <p className="text-paper font-medium">Base fare</p>
                <p className="text-paper-faint">Covers dispatch and the first leg of every trip</p>
              </div>
              <span className="font-mono text-paper">₦1,500</span>
            </div>
            <div className="flex justify-between border-b border-ink-border pb-3">
              <div>
                <p className="text-paper font-medium">Distance</p>
                <p className="text-paper-faint">Per kilometer, from pickup through every stop</p>
              </div>
              <span className="font-mono text-paper">₦250/km</span>
            </div>
            <div className="flex justify-between pb-1">
              <div>
                <p className="text-paper font-medium">Escort driver</p>
                <p className="text-paper-faint">Built into every fare — never an optional add-on</p>
              </div>
              <span className="font-mono text-paper">₦1,000</span>
            </div>
          </div>
          <p className="text-xs text-paper-faint mt-4">
            Rates shown are current defaults and may be adjusted by our operations team as the service scales. Your
            exact fare is always shown before you confirm a booking — never estimated after the fact.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          <div className="bg-ink-900 border border-ink-border rounded-xl p-5">
            <h3 className="font-display font-medium text-paper mb-2">No surge, by default</h3>
            <p className="text-sm text-paper-dim leading-relaxed">
              We don&apos;t use demand-based surge pricing today. If that ever changes for specific high-demand
              windows, it will be clearly disclosed on your fare estimate before you book — never applied silently.
            </p>
          </div>
          <div className="bg-ink-900 border border-ink-border rounded-xl p-5">
            <h3 className="font-display font-medium text-paper mb-2">Corporate rates</h3>
            <p className="text-sm text-paper-dim leading-relaxed">
              Companies with a corporate account can negotiate a discounted rate and set per-trip spend limits for
              employees. <Link href="/corporate" className="text-amber-strong">See AbegDrive for Business →</Link>
            </p>
          </div>
        </div>

        <div className="bg-ink-900 border border-ink-border rounded-xl p-6 text-center">
          <p className="text-paper font-display font-medium mb-2">See your exact fare before you book</p>
          <p className="text-sm text-paper-dim mb-4">
            The booking flow shows a full fare breakdown before you confirm anything.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-amber hover:bg-amber-strong text-ink-950 px-6 py-2.5 rounded-lg font-semibold"
          >
            Get started
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
