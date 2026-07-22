"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/apiClient";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white border border-neutral-200 rounded-2xl p-5 ${className}`}>{children}</div>;
}

export function Badge({ tone, children }: { tone: "success" | "warning" | "danger" | "neutral" | "info"; children: ReactNode }) {
  const tones: Record<string, string> = {
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tones[tone]}`}>
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
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
}) {
  const variants: Record<string, string> = {
    primary: "bg-amber-500 hover:bg-amber-600 text-white disabled:bg-neutral-300",
    secondary: "bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-700 disabled:opacity-50",
    danger: "bg-red-600 hover:bg-red-700 text-white disabled:bg-neutral-300",
    ghost: "bg-transparent hover:bg-neutral-100 text-neutral-600",
  };
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${variants[variant]} ${props.className ?? ""}`}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{message}</div>
  );
}

export function SuccessBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
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
      <span className="block text-sm font-medium text-neutral-700 mb-1">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-neutral-400 mt-1">{hint}</span>}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${props.className ?? ""}`}
    />
  );
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
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
              <span className="font-semibold text-neutral-900">AbegDrive</span>
            </a>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeHref === link.href
                      ? "bg-amber-50 text-amber-700"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="neutral">{roleLabel}</Badge>
            <button
              onClick={() => {
                clearSession();
                router.push("/login");
              }}
              className="text-sm text-neutral-500 hover:text-neutral-800"
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
