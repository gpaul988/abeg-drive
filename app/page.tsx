import Link from "next/link";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/safety", label: "Safety" },
  { href: "/pricing", label: "Pricing" },
  { href: "/corporate", label: "For business" },
  { href: "/partners", label: "Venue partners" },
  { href: "/contact-us", label: "Contact" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-ink-border bg-ink-950/85 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber flex items-center justify-center text-ink-950 text-sm font-bold font-display">
              A
            </div>
            <span className="font-display font-semibold text-paper tracking-tight">AbegDrive</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-paper-dim">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-paper transition-colors">
                {l.label}
              </Link>
            ))}
            <Link href="/login" className="hover:text-paper transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-amber hover:bg-amber-strong text-ink-950 px-4 py-2 rounded-lg font-semibold shadow-[0_0_0_1px_rgba(245,166,35,0.35),0_4px_16px_-4px_rgba(245,166,35,0.5)]"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO — the signature moment is the live-tracking HUD card itself,
          not a stock photo or generic gradient blob. This is what the
          product actually does: a driver arrives, and you watch it happen. */}
      <section className="relative overflow-hidden border-b border-ink-border">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 w-[700px] h-[700px] -translate-y-1/3 translate-x-1/4"
        >
          <div className="absolute inset-0 rounded-full border border-amber/10" />
          <div className="absolute inset-[80px] rounded-full border border-amber/10" />
          <div className="absolute inset-[160px] rounded-full border border-teal/10" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-ink-border-strong text-xs text-paper-dim">
              <span className="radar-dot text-teal" />
              Now live in Port Harcourt
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold text-paper mb-5 tracking-tight leading-[1.05]">
              Your car, driven home.
              <br />
              <span className="text-amber">Never your own.</span>
            </h1>
            <p className="text-lg text-paper-dim max-w-lg mb-8 leading-relaxed">
              A vetted two-driver team comes to you, takes the wheel of your own vehicle, and gets you home —
              tracked live, end to end. Built for Port Harcourt, built for the nights that need it.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/signup"
                className="bg-amber hover:bg-amber-strong text-ink-950 px-6 py-3 rounded-lg font-semibold shadow-[0_0_0_1px_rgba(245,166,35,0.35),0_4px_16px_-4px_rgba(245,166,35,0.5)]"
              >
                Get started
              </Link>
              <Link
                href="/how-it-works"
                className="border border-ink-border-strong hover:border-paper-dim px-6 py-3 rounded-lg font-medium text-paper transition-colors"
              >
                See how it works
              </Link>
            </div>
          </div>

          {/* Live-tracking HUD card — the product's actual core screen,
              shown as the hero visual instead of illustration. */}
          <div className="relative">
            <div className="bg-ink-900 border border-ink-border rounded-2xl p-5 shadow-2xl shadow-black/40 max-w-sm mx-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-teal/10 text-teal-strong border-teal/30">
                  <span className="radar-dot text-teal" />
                  Trip in progress
                </span>
                <span className="font-mono text-xs text-paper-faint">#7F3A9C</span>
              </div>
              <div className="aspect-[4/3] rounded-xl bg-ink-850 border border-ink-border mb-4 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <span className="radar-dot text-amber scale-[3]" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex justify-between font-mono text-[10px] text-paper-faint">
                  <span>4.8156° N</span>
                  <span>7.0498° E</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-paper font-medium">Driver: Emeka O.</span>
                <span className="text-paper-dim">★ 4.9</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-paper-dim">Escort: Bright A.</span>
                <span className="text-teal-strong font-medium">ETA 6 min</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — a real ordered sequence, so numbering earns its
          place here. */}
      <section className="max-w-6xl mx-auto px-4 py-20 border-b border-ink-border">
        <p className="text-teal-strong text-sm font-mono mb-2 tracking-wide">HOW IT WORKS</p>
        <h2 className="text-3xl font-display font-semibold text-paper mb-12 tracking-tight">
          Four steps, start to safely home.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { n: "01", title: "Book", body: "Tell us where you are and where you're headed. We estimate the fare instantly." },
            { n: "02", title: "Dispatched", body: "A verified primary driver and an escort driver are matched to you — always as a pair." },
            { n: "03", title: "Tracked", body: "Watch the whole trip live. Share the link with someone you trust, no login needed." },
            { n: "04", title: "Home", body: "Your car, your driveway. Rate the trip, get your receipt, done." },
          ].map((step) => (
            <div key={step.n}>
              <p className="font-mono text-sm text-paper-faint mb-3">{step.n}</p>
              <h3 className="font-display font-semibold text-paper mb-2">{step.title}</h3>
              <p className="text-sm text-paper-dim leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SAFETY PILLARS */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <p className="text-amber text-sm font-mono mb-2 tracking-wide">WHY IT&apos;S SAFE</p>
        <h2 className="text-3xl font-display font-semibold text-paper mb-12 tracking-tight max-w-2xl">
          Built with the risks of a real night out in mind — not an afterthought.
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-ink-900 border border-ink-border rounded-xl p-5">
            <p className="font-display font-medium text-paper mb-1">Verified drivers only</p>
            <p className="text-sm text-paper-dim leading-relaxed">
              NIN, BVN, selfie liveness, and a guarantor reference — before anyone gets behind the wheel.
            </p>
          </div>
          <div className="bg-ink-900 border border-ink-border rounded-xl p-5">
            <p className="font-display font-medium text-paper mb-1">Two-driver dispatch</p>
            <p className="text-sm text-paper-dim leading-relaxed">
              A backup driver always accompanies the primary — safety in numbers, on every single trip.
            </p>
          </div>
          <div className="bg-ink-900 border border-ink-border rounded-xl p-5">
            <p className="font-display font-medium text-paper mb-1">Live tracking + panic button</p>
            <p className="text-sm text-paper-dim leading-relaxed">
              Share your trip, watch it live, and get emergency response in seconds if you ever need it.
            </p>
          </div>
        </div>
        <Link href="/safety" className="inline-block mt-8 text-amber-strong font-medium text-sm">
          Read our full safety approach →
        </Link>
      </section>

      <footer className="border-t border-ink-border">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-paper-faint">
          <span>© {new Date().getFullYear()} AbegDrive. Port Harcourt, Rivers State.</span>
          <div className="flex items-center gap-6">
            <Link href="/contact-us" className="hover:text-paper-dim">
              Contact
            </Link>
            <Link href="/terms" className="hover:text-paper-dim">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-paper-dim">
              Privacy
            </Link>
            <Link href="/faq" className="hover:text-paper-dim">
              FAQ
            </Link>
            <Link href="/driver-agreement" className="hover:text-paper-dim">
              Driver agreement
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
