"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, saveSession } from "@/lib/apiClient";

interface PartnershipModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

const VENUE_TYPES = ["Hotel", "Event center", "Lounge / bar", "Restaurant", "Corporate campus", "Other"];

export function PartnershipModal({ open, onClose }: PartnershipModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [venueType, setVenueType] = useState("Hotel");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset internal state whenever the modal is closed and reopened.
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setVenueType("Hotel");
        setVenueName("");
        setAddress("");
        setContactPerson("");
        setContactPhone("");
        setAdminEmail("");
        setAdminPassword("");
        setError(null);
        setSubmitted(false);
      }, 200);
    }
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function validateStep1(): string | null {
    if (!venueName.trim()) return "Enter your venue's name.";
    if (!address.trim() || address.trim().length < 5) return "Enter a full address.";
    return null;
  }

  function validateStep2(): string | null {
    if (!contactPerson.trim()) return "Enter a contact person.";
    if (!/^(\+234|0)[789][01]\d{8}$/.test(contactPhone)) return "Enter a valid Nigerian phone number.";
    if (!/^\S+@\S+\.\S+$/.test(adminEmail)) return "Enter a valid email address.";
    if (adminPassword.length < 8) return "Password must be at least 8 characters.";
    return null;
  }

  function goNext() {
    setError(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) return setError(err);
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) return setError(err);
      setStep(3);
    }
  }

  function goBack() {
    setError(null);
    if (step > 1) setStep((s) => (s - 1) as Step);
  }

  async function onSubmit() {
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<{ accessToken: string; refreshToken: string; error?: string }>(
      "/partner/signup",
      {
        venueName: `${venueName}${venueType !== "Other" ? ` (${venueType})` : ""}`,
        address,
        contactPerson,
        contactPhone,
        adminEmail,
        adminPassword,
      }
    );
    setLoading(false);
    if (status !== 201) {
      setError(
        data.error === "email_already_registered"
          ? "That email is already registered — try logging in instead."
          : data.error === "phone_already_registered"
          ? "That phone number is already registered."
          : "Something went wrong submitting your application. Please try again."
      );
      return;
    }
    saveSession({ userId: "", accessToken: data.accessToken, refreshToken: data.refreshToken, role: "venue_partner" });
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-ink-900 border border-ink-border-strong rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Ambient radar accent in the corner — signature motif, used once,
            meaningfully, on the highest-intent conversion surface in the
            product. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full border border-amber/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-40 h-40 rounded-full border border-teal/10"
        />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-paper-faint hover:text-paper transition-colors text-xl leading-none z-10"
        >
          ✕
        </button>

        <div className="relative p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal/10 border border-teal/30 mb-4">
                <span className="radar-dot text-teal" />
              </div>
              <h2 className="font-display font-semibold text-paper text-xl mb-2">Application received</h2>
              <p className="text-paper-dim text-sm mb-6 leading-relaxed">
                Your venue starts un-whitelisted while our ops team reviews it — usually within a couple of business
                days. You&apos;ll be able to request drivers for guests the moment it&apos;s approved.
              </p>
              <button
                onClick={() => router.push("/partner/dashboard")}
                className="bg-amber hover:bg-amber-strong text-ink-950 px-6 py-2.5 rounded-lg font-semibold"
              >
                Go to your dashboard
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-teal-strong text-xs font-mono mb-2 tracking-wide">PARTNER APPLICATION</p>
                <h2 className="font-display font-semibold text-paper text-xl mb-1">Become a venue partner</h2>
                <p className="text-sm text-paper-dim">
                  Offer your guests a safe ride home, right from your front desk.
                </p>
              </div>

              <div className="flex items-center gap-1.5 mb-6">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1 rounded-full flex-1 transition-colors ${
                      s <= step ? "bg-amber" : "bg-ink-border"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <div className="mb-4 text-sm text-danger-strong bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div>
                  <p className="text-xs font-medium text-paper-faint mb-3 uppercase tracking-wide">Venue details</p>
                  <label className="block mb-4">
                    <span className="block text-sm font-medium text-paper-dim mb-1.5">Venue type</span>
                    <div className="grid grid-cols-2 gap-2">
                      {VENUE_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setVenueType(t)}
                          className={`border rounded-lg py-2 text-xs font-medium transition-colors ${
                            venueType === t
                              ? "border-amber bg-amber/10 text-amber-strong"
                              : "border-ink-border-strong text-paper-dim hover:border-paper-dim"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </label>
                  <label className="block mb-4">
                    <span className="block text-sm font-medium text-paper-dim mb-1.5">Venue name</span>
                    <input
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="e.g. Sail Grand Hotel"
                      className="w-full bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50"
                    />
                  </label>
                  <label className="block mb-2">
                    <span className="block text-sm font-medium text-paper-dim mb-1.5">Full address</span>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="1 Aba Road, Port Harcourt"
                      className="w-full bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50"
                    />
                  </label>
                </div>
              )}

              {step === 2 && (
                <div>
                  <p className="text-xs font-medium text-paper-faint mb-3 uppercase tracking-wide">
                    Contact & account
                  </p>
                  <label className="block mb-4">
                    <span className="block text-sm font-medium text-paper-dim mb-1.5">Contact person</span>
                    <input
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Front desk manager's name"
                      className="w-full bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50"
                    />
                  </label>
                  <label className="block mb-4">
                    <span className="block text-sm font-medium text-paper-dim mb-1.5">Contact phone</span>
                    <input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="080XXXXXXXX"
                      className="w-full bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50"
                    />
                  </label>
                  <label className="block mb-4">
                    <span className="block text-sm font-medium text-paper-dim mb-1.5">Your email</span>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="you@venue.com"
                      className="w-full bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50"
                    />
                  </label>
                  <label className="block mb-2">
                    <span className="block text-sm font-medium text-paper-dim mb-1.5">Password</span>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full bg-ink-850 border border-ink-border rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50"
                    />
                  </label>
                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="text-xs font-medium text-paper-faint mb-3 uppercase tracking-wide">Review</p>
                  <div className="bg-ink-850 border border-ink-border rounded-lg p-4 space-y-2 text-sm mb-2">
                    <div className="flex justify-between">
                      <span className="text-paper-faint">Venue</span>
                      <span className="text-paper font-medium">{venueName || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-paper-faint">Type</span>
                      <span className="text-paper">{venueType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-paper-faint">Address</span>
                      <span className="text-paper text-right max-w-[220px]">{address || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-paper-faint">Contact</span>
                      <span className="text-paper">{contactPerson || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-paper-faint">Phone</span>
                      <span className="text-paper font-mono text-xs">{contactPhone || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-paper-faint">Email</span>
                      <span className="text-paper">{adminEmail || "—"}</span>
                    </div>
                  </div>
                  <p className="text-xs text-paper-faint mb-2">
                    New venues start un-whitelisted pending a quick review by our ops team.
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-ink-800 border border-ink-border-strong hover:border-paper-dim text-paper transition-colors"
                  >
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-amber hover:bg-amber-strong text-ink-950 transition-colors"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={loading}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-amber hover:bg-amber-strong disabled:bg-ink-border disabled:text-paper-faint text-ink-950 transition-colors"
                  >
                    {loading ? "Submitting…" : "Submit application"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
