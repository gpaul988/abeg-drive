"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/apiClient";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-ink-900 border border-ink-border rounded-xl p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset] ${className}`}
    >
      {children}
    </div>
  );
}

type Tone = "success" | "warning" | "danger" | "neutral" | "info";

const TONE_STYLES: Record<Tone, string> = {
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-amber/10 text-amber-strong border-amber/30",
  danger: "bg-danger/10 text-danger-strong border-danger/30",
  neutral: "bg-white/5 text-paper-dim border-ink-border-strong",
  info: "bg-teal/10 text-teal-strong border-teal/30",
};

/** Live states use the radar-ping motif; everything else is a plain pill. */
const LIVE_TONES: Tone[] = ["success", "info"];

export function Badge({
  tone,
  children,
  live = false,
}: {
  tone: Tone;
  children: ReactNode;
  live?: boolean;
}) {
  const showPing = live && LIVE_TONES.includes(tone);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${TONE_STYLES[tone]}`}
    >
      {showPing && <span className="radar-dot" />}
      {children}
    </span>
  );
}

export function Button({
  variant = "primary",
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "teal";
  loading?: boolean;
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-amber text-ink-950 hover:bg-amber-strong disabled:bg-ink-border disabled:text-paper-faint font-semibold shadow-[0_0_0_1px_rgba(245,166,35,0.35),0_4px_16px_-4px_rgba(245,166,35,0.5)]",
    teal: "bg-teal text-ink-950 hover:bg-teal-strong disabled:bg-ink-border disabled:text-paper-faint font-semibold shadow-[0_0_0_1px_rgba(45,216,196,0.35),0_4px_16px_-4px_rgba(45,216,196,0.5)]",
    secondary: "bg-ink-800 border border-ink-border-strong hover:border-paper-dim text-paper disabled:opacity-40",
    danger:
      "bg-danger text-ink-950 hover:bg-danger-strong disabled:bg-ink-border disabled:text-paper-faint font-semibold",
    ghost: "bg-transparent hover:bg-white/5 text-paper-dim",
  };
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`px-4 py-2 rounded-lg text-sm transition-colors ${variants[variant]} ${props.className ?? ""}`}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 text-sm text-danger-strong bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
      {message}
    </div>
  );
}

export function SuccessBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 text-sm text-success bg-success/10 border border-success/30 rounded-lg px-3 py-2">
      {message}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-paper-dim mb-1.5">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-paper-faint mt-1">{hint}</span>}
      {error && <span className="block text-xs text-danger-strong mt-1">{error}</span>}
    </label>
  );
}

const inputBase =
  "w-full bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50 transition-colors";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

/** IBM Plex Mono, for data that is literally data: trip IDs, GPS
 * coordinates, timestamps, references. Not a stylistic flourish elsewhere. */
export function DataText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`font-mono text-xs tracking-tight ${className}`}>{children}</span>;
}

interface NavLink {
  href: string;
  label: string;
}

export function AppShell({
  children,
  navLinks,
  activeHref,
  roleLabel,
}: {
  children: ReactNode;
  navLinks: NavLink[];
  activeHref: string;
  roleLabel: string;
}) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-ink-border bg-ink-950/85 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber flex items-center justify-center text-ink-950 text-sm font-bold font-display">
                A
              </div>
              <span className="font-display font-semibold text-lg text-paper tracking-tight">AbegDrive</span>
            </a>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeHref === link.href
                      ? "bg-amber/10 text-amber-strong"
                      : "text-paper-dim hover:bg-white/5 hover:text-paper"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="neutral">{roleLabel}</Badge>
            <a href="/account/security" className="text-sm text-paper-faint hover:text-paper transition-colors">
              Account
            </a>
            <button
              onClick={() => {
                clearSession();
                router.push("/login");
              }}
              className="text-sm text-paper-faint hover:text-paper transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
