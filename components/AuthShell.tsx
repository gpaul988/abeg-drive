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
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-semibold text-lg text-neutral-900">SafeKeys</span>
          </div>
          {step && totalSteps && (
            <div className="flex items-center gap-1.5 justify-center mb-6">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i < step ? "bg-amber-500 w-8" : "bg-neutral-200 w-8"
                  }`}
                />
              ))}
            </div>
          )}
          <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
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
      className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-300 text-white font-medium rounded-lg py-2.5 transition-colors"
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
      <span className="block text-sm font-medium text-neutral-700 mb-1">{label}</span>
      <input
        {...props}
        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
      />
    </label>
  );
}
