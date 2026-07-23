"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, ErrorBanner, PrimaryButton, TextField } from "@/components/AuthShell";
import { Field, Select } from "@/components/ui";
import { apiPost, getSession, getSignupState, saveSession } from "@/lib/apiClient";

type Stage = "nin" | "selfie" | "competency" | "documents" | "done";

const STAGE_ORDER: Stage[] = ["nin", "selfie", "competency", "documents", "done"];

export default function DriverOnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [stage, setStage] = useState<Stage>("nin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nin, setNin] = useState("");
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [bvn, setBvn] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [guarantorName, setGuarantorName] = useState("");
  const [guarantorPhone, setGuarantorPhone] = useState("");
  const [guarantorRelationship, setGuarantorRelationship] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const state = getSignupState();
    if (!state) {
      router.replace("/driver/signup");
      return;
    }
    setUserId(state.userId);
  }, [router]);

  async function onSubmitNin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<{ verified: boolean }>("/auth/identity/nin-verify", {
      userId,
      ninNumber: nin,
    });
    setLoading(false);
    if (status !== 200 || !data.verified) {
      setError("We couldn't verify that NIN. Please double-check and try again.");
      return;
    }
    setStage("selfie");
  }

  async function onCaptureSelfie() {
    setError(null);
    setLoading(true);
    const { status, data } = await apiPost<{ match: boolean }>("/auth/identity/selfie-liveness", {
      userId,
      selfieImageBase64: "dev-placeholder-selfie-data",
    });
    setLoading(false);
    if (status !== 200 || !data.match) {
      setError("Liveness check failed. Please try again with your face clearly visible.");
      return;
    }
    setStage("competency");
  }

  function toggleCompetency(value: string) {
    setCompetencies((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]));
  }

  async function onSubmitCompetency(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (competencies.length === 0) {
      setError("Select at least one vehicle competency.");
      return;
    }
    setLoading(true);
    const tokenRes = await apiPost<{ accessToken: string; refreshToken: string }>("/auth/onboarding-token", {
      userId,
    });
    if (tokenRes.status !== 200) {
      setLoading(false);
      setError("Your identity verification isn't complete. Please restart the application.");
      return;
    }
    const { status } = await apiPost(
      "/drivers/apply",
      { vehicleCompetency: competencies },
      tokenRes.data.accessToken
    );
    setLoading(false);
    if (status !== 201) {
      setError("Something went wrong submitting your application. Please try again.");
      return;
    }
    saveSession({ userId, accessToken: tokenRes.data.accessToken, refreshToken: tokenRes.data.refreshToken, role: "driver" });
    setStage("documents");
  }

  async function onSubmitDocuments(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError("You must consent to a background check to continue.");
      return;
    }
    setLoading(true);
    const session = getSession();
    const { status, data } = await apiPost<{ error?: string }>(
      "/drivers/documents",
      {
        bvnNumber: bvn,
        licenseNumber,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry).toISOString() : undefined,
        guarantorName,
        guarantorPhone,
        guarantorRelationship,
        backgroundCheckConsent: consent,
      },
      session?.accessToken
    );
    setLoading(false);
    if (status !== 200) {
      setError(humanizeDocError(data.error));
      return;
    }
    setStage("done");
  }

  const stepIndex = STAGE_ORDER.indexOf(stage) + 1;

  return (
    <AuthShell
      step={stepIndex}
      totalSteps={5}
      title={stageTitle(stage)}
      subtitle={stageSubtitle(stage)}
    >
      {stage === "nin" && (
        <form onSubmit={onSubmitNin}>
          <ErrorBanner message={error} />
          <TextField
            label="National Identification Number (NIN)"
            inputMode="numeric"
            maxLength={11}
            placeholder="12345678901"
            required
            value={nin}
            onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
          />
          <PrimaryButton type="submit" loading={loading} disabled={nin.length !== 11}>
            Verify NIN
          </PrimaryButton>
        </form>
      )}

      {stage === "selfie" && (
        <div>
          <ErrorBanner message={error} />
          <div className="aspect-square bg-ink-850 rounded-xl border border-dashed border-ink-border-strong flex items-center justify-center mb-4">
            <span className="text-paper-faint text-sm">Camera preview</span>
          </div>
          <PrimaryButton type="button" loading={loading} onClick={onCaptureSelfie}>
            Capture selfie
          </PrimaryButton>
        </div>
      )}

      {stage === "competency" && (
        <form onSubmit={onSubmitCompetency}>
          <ErrorBanner message={error} />
          <p className="text-sm text-paper-dim mb-3">Which vehicles are you competent to drive?</p>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {["manual", "automatic", "suv", "sedan", "motorcycle"].map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => toggleCompetency(c)}
                className={`border rounded-lg py-2.5 text-sm font-medium capitalize ${
                  competencies.includes(c)
                    ? "border-amber bg-amber/10 text-amber-strong"
                    : "border-ink-border-strong text-paper-dim"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <PrimaryButton type="submit" loading={loading}>
            Continue
          </PrimaryButton>
        </form>
      )}

      {stage === "documents" && (
        <form onSubmit={onSubmitDocuments}>
          <ErrorBanner message={error} />
          <TextField
            label="Bank Verification Number (BVN)"
            inputMode="numeric"
            maxLength={11}
            required
            value={bvn}
            onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
          />
          <TextField
            label="Driver's license number"
            required
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
          />
          <Field label="License expiry date">
            <input
              type="date"
              required
              value={licenseExpiry}
              onChange={(e) => setLicenseExpiry(e.target.value)}
              className="w-full border border-ink-border-strong rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/50"
            />
          </Field>
          <p className="text-xs text-paper-dim mt-4 mb-2">
            Guarantor details — a community trust reference we may contact
          </p>
          <TextField label="Guarantor full name" required value={guarantorName} onChange={(e) => setGuarantorName(e.target.value)} />
          <TextField
            label="Guarantor phone"
            required
            value={guarantorPhone}
            onChange={(e) => setGuarantorPhone(e.target.value)}
          />
          <TextField
            label="Relationship to guarantor"
            required
            value={guarantorRelationship}
            onChange={(e) => setGuarantorRelationship(e.target.value)}
          />
          <label className="flex items-start gap-2 mt-4 mb-4 text-sm text-paper-dim">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
            <span>
              I consent to a background check and understand a member of our team may schedule a physical address
              verification visit.
            </span>
          </label>
          <PrimaryButton type="submit" loading={loading}>
            Submit application
          </PrimaryButton>
        </form>
      )}

      {stage === "done" && (
        <div className="text-center py-4">
          <p className="text-paper-dim mb-2 font-medium">Application submitted!</p>
          <p className="text-sm text-paper-dim mb-6">
            Our team reviews license, guarantor, and background check details manually before approval — this
            usually takes 2–3 business days. We&apos;ll notify you by SMS.
          </p>
          <PrimaryButton type="button" onClick={() => router.push("/driver/probation-status")}>
            View application status
          </PrimaryButton>
        </div>
      )}
    </AuthShell>
  );
}

function stageTitle(stage: Stage): string {
  switch (stage) {
    case "nin":
      return "Verify your identity";
    case "selfie":
      return "Take a quick selfie";
    case "competency":
      return "Vehicle competency";
    case "documents":
      return "License & guarantor details";
    case "done":
      return "Application received";
  }
}

function stageSubtitle(stage: Stage): string {
  switch (stage) {
    case "nin":
      return "Required before we can review your application";
    case "selfie":
      return "We match this against your ID";
    case "competency":
      return "Select every vehicle type you can safely operate";
    case "documents":
      return "Manual review — no automated approval, per our safety policy";
    case "done":
      return "";
  }
}

function humanizeDocError(code?: string): string {
  switch (code) {
    case "validation_error":
      return "Please check every field — BVN must be 11 digits and phone numbers must be valid.";
    default:
      return "Something went wrong submitting your documents. Please try again.";
  }
}
