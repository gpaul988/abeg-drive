import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white text-sm font-bold">
              S
            </div>
            <span className="font-semibold text-neutral-900">AbegDrive</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-neutral-600">
            <Link href="/how-it-works" className="hover:text-neutral-900">How it works</Link>
            <Link href="/safety" className="hover:text-neutral-900">Safety</Link>
            <Link href="/pricing" className="hover:text-neutral-900">Pricing</Link>
            <Link href="/corporate" className="hover:text-neutral-900">For business</Link>
            <Link href="/login" className="hover:text-neutral-900">Log in</Link>
            <Link href="/signup" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium">
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold text-neutral-900 mb-4 tracking-tight">
          Never drive home unsafe again.
        </h1>
        <p className="text-lg text-neutral-500 max-w-xl mx-auto mb-8">
          Book a verified professional driver to take <em>your own car</em> home — you and your vehicle,
          safely delivered. Port Harcourt&apos;s first designated driver service.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/signup" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium">
            Get started
          </Link>
          <Link href="/how-it-works" className="border border-neutral-300 hover:border-neutral-400 px-6 py-3 rounded-lg font-medium text-neutral-700">
            How it works
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-20 text-left">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <p className="font-medium text-neutral-900 mb-1">Verified drivers only</p>
            <p className="text-sm text-neutral-500">NIN, selfie liveness, and guarantor checks before anyone drives.</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <p className="font-medium text-neutral-900 mb-1">Two-driver dispatch</p>
            <p className="text-sm text-neutral-500">A backup driver always accompanies — safety in numbers.</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <p className="font-medium text-neutral-900 mb-1">Live tracking + panic button</p>
            <p className="text-sm text-neutral-500">Share your trip, watch it live, and get help in seconds if you need it.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
