export function AuthShell({
  step,
  totalSteps,
  title,
  subtitle,
  children,
}: {
  step?: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4 py-10 relative overflow-hidden">
      {/* Ambient radar rings — the one atmospheric touch on auth screens,
          echoing the live-tracking product moment without competing with
          the form. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full border border-amber/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full border border-amber/10"
      />

      <div className="w-full max-w-md relative">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center text-ink-950 font-bold font-display">
              A
            </div>
            <span className="font-display font-semibold text-lg text-paper tracking-tight">AbegDrive</span>
          </div>
          {step && totalSteps && (
            <div className="flex items-center gap-1.5 justify-center mb-6">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i < step ? "bg-amber w-8" : "bg-ink-border w-8"
                  }`}
                />
              ))}
            </div>
          )}
          <h1 className="text-xl font-display font-semibold text-paper tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-paper-dim mt-1">{subtitle}</p>}
        </div>
        <div className="bg-ink-900 border border-ink-border rounded-xl p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]">
          {children}
        </div>
      </div>
    </div>
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

export function PrimaryButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-full bg-amber hover:bg-amber-strong disabled:bg-ink-border disabled:text-paper-faint text-ink-950 font-semibold rounded-lg py-2.5 transition-colors shadow-[0_0_0_1px_rgba(245,166,35,0.35),0_4px_16px_-4px_rgba(245,166,35,0.5)]"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

export function TextField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-paper-dim mb-1.5">{label}</span>
      <input
        {...props}
        className="w-full bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50 transition-colors"
      />
    </label>
  );
}
