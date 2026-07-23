import Link from "next/link";

export default function CorporateMarketingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-semibold text-paper mb-2">AbegDrive for Business</h1>
        <p className="text-paper-dim mb-6">
          Give your oil & gas, banking, or enterprise team a safe-ride-home policy your compliance officer will
          love. Set spend limits, get usage reports, and keep your people safe after hours.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/corporate/signup" className="bg-amber hover:bg-amber-strong text-ink-950 px-5 py-2.5 rounded-lg font-medium">
            Set up a corporate account
          </Link>
          <Link href="/" className="text-amber-strong font-medium">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
