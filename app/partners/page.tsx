import Link from "next/link";

export default function PartnersMarketingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Become a venue partner</h1>
        <p className="text-neutral-500 mb-6">
          Hotels, event centers, and bars — offer your guests a safe ride home and request a driver on their
          behalf, right from your front desk.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/partner/signup" className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium">
            Apply as a venue partner
          </Link>
          <Link href="/" className="text-amber-600 font-medium">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
