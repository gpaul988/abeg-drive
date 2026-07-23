import Link from "next/link";

export default function CorporateMarketingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">AbegDrive for Business</h1>
        <p className="text-neutral-500 mb-6">
          Give your oil & gas, banking, or enterprise team a safe-ride-home policy your compliance officer will
          love. Set spend limits, get usage reports, and keep your people safe after hours.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/corporate/signup" className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium">
            Set up a corporate account
          </Link>
          <Link href="/" className="text-amber-600 font-medium">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
