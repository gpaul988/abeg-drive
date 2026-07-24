import Link from "next/link";
import { ReactNode } from "react";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/safety", label: "Safety" },
  { href: "/pricing", label: "Pricing" },
  { href: "/corporate", label: "For business" },
  { href: "/partners", label: "Venue partners" },
  { href: "/contact-us", label: "Contact" },
];

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-ink-border bg-ink-950/85 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber flex items-center justify-center text-ink-950 text-sm font-bold font-display">
              A
            </div>
            <span className="font-display font-semibold text-paper tracking-tight">AbegDrive</span>
          </Link>
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

      {children}

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

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-16 pb-10 text-center">
      <p className="text-amber text-sm font-mono mb-3 tracking-wide">{eyebrow}</p>
      <h1 className="text-4xl font-display font-semibold text-paper mb-4 tracking-tight">{title}</h1>
      {subtitle && <p className="text-lg text-paper-dim leading-relaxed">{subtitle}</p>}
    </div>
  );
}
