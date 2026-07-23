"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Button, Card, ErrorBanner, Field, Select, TextInput } from "@/components/ui";
import { apiPost, getSession } from "@/lib/apiClient";
import { customerNavLinks } from "@/lib/navLinks";

interface StopInput {
  label: string;
  address: string;
  lat: string;
  lng: string;
}

interface FareBreakdown {
  baseFare: number;
  distanceKm: number;
  distanceFare: number;
  escortSurcharge: number;
  total: number;
}

const STEP_LABELS = ["Route", "Vehicle", "Schedule", "Confirm"];

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: pickup + destinations (multi-stop)
  const [pickup, setPickup] = useState<StopInput>({ label: "Pickup", address: "", lat: "4.8156", lng: "7.0498" });
  const [destinations, setDestinations] = useState<StopInput[]>([
    { label: "Destination 1", address: "", lat: "4.85", lng: "7.03" },
  ]);

  // Step 2: vehicle details
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [transmissionType, setTransmissionType] = useState<"manual" | "automatic">("automatic");

  // Step 3: schedule
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduledTime, setScheduledTime] = useState("");

  // Step 4: fare
  const [fare, setFare] = useState<FareBreakdown | null>(null);

  useEffect(() => {
    if (!getSession()) router.replace("/login");
  }, [router]);

  function addStop() {
    if (destinations.length >= 5) return;
    setDestinations([
      ...destinations,
      { label: `Destination ${destinations.length + 1}`, address: "", lat: "4.83", lng: "7.02" },
    ]);
  }

  function removeStop(index: number) {
    setDestinations(destinations.filter((_, i) => i !== index));
  }

  function updateDestination(index: number, patch: Partial<StopInput>) {
    setDestinations(destinations.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  async function goToConfirm() {
    setError(null);
    if (!pickup.address || destinations.some((d) => !d.address)) {
      setError("Please fill in every address before continuing.");
      return;
    }
    if (!make || !model || !plateNumber) {
      setError("Please fill in your vehicle's details.");
      return;
    }
    setLoading(true);
    const session = getSession()!;
    const { status, data } = await apiPost<{ fareBreakdown: FareBreakdown }>(
      "/trips/estimate",
      {
        pickup: { lat: Number(pickup.lat), lng: Number(pickup.lng) },
        destinations: destinations.map((d) => ({ lat: Number(d.lat), lng: Number(d.lng) })),
      },
      session.accessToken
    );
    setLoading(false);
    if (status !== 200) {
      setError("Couldn't calculate a fare estimate. Please check your locations and try again.");
      return;
    }
    setFare(data.fareBreakdown);
    setStep(4);
  }

  async function confirmBooking() {
    setError(null);
    setLoading(true);
    const session = getSession()!;
    const { status, data } = await apiPost<{ trip: { id: string }; error?: string }>(
      "/trips",
      {
        pickup: { label: pickup.label, address: pickup.address, point: { lat: Number(pickup.lat), lng: Number(pickup.lng) } },
        destinations: destinations.map((d) => ({
          label: d.label,
          address: d.address,
          point: { lat: Number(d.lat), lng: Number(d.lng) },
        })),
        vehicle: { make, model, plateNumber, transmissionType },
        scheduledTime: scheduleMode === "later" && scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
      },
      session.accessToken
    );
    setLoading(false);
    if (status !== 201) {
      setError(humanizeTripError(data.error));
      return;
    }
    router.push(`/book/tracking/${data.trip.id}`);
  }

  return (
    <AppShell navLinks={customerNavLinks} activeHref="/book" roleLabel="Customer">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-1.5 mb-8">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-1.5 rounded-full mb-1.5 ${i + 1 <= step ? "bg-amber" : "bg-ink-border"}`} />
              <span className={`text-xs ${i + 1 === step ? "text-paper font-medium" : "text-paper-faint"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <Card>
          <ErrorBanner message={error} />

          {step === 1 && (
            <div>
              <h2 className="font-semibold text-paper mb-4">Where are we picking you up?</h2>
              <Field label="Pickup address">
                <TextInput
                  placeholder="e.g. 12 Aba Road, Port Harcourt"
                  value={pickup.address}
                  onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
                />
              </Field>

              <h3 className="text-sm font-medium text-paper-dim mb-2 mt-6">Destination{destinations.length > 1 ? "s" : ""}</h3>
              {destinations.map((d, i) => (
                <div key={i} className="flex items-start gap-2 mb-3">
                  <div className="flex-1">
                    <TextInput
                      placeholder={`Stop ${i + 1} address`}
                      value={d.address}
                      onChange={(e) => updateDestination(i, { address: e.target.value })}
                    />
                  </div>
                  {destinations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStop(i)}
                      className="text-paper-faint hover:text-danger mt-2 text-sm"
                      aria-label="Remove stop"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {destinations.length < 5 && (
                <button
                  type="button"
                  onClick={addStop}
                  className="text-sm text-amber-strong font-medium mb-6"
                >
                  + Add another stop
                </button>
              )}

              <Button
                className="w-full mt-2"
                onClick={() => {
                  setError(null);
                  if (!pickup.address || destinations.some((d) => !d.address)) {
                    setError("Please fill in every address before continuing.");
                    return;
                  }
                  setStep(2);
                }}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-semibold text-paper mb-4">Tell us about your vehicle</h2>
              <p className="text-sm text-paper-dim mb-4">
                We match you with a driver competent in your transmission type.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Make">
                  <TextInput placeholder="Toyota" value={make} onChange={(e) => setMake(e.target.value)} />
                </Field>
                <Field label="Model">
                  <TextInput placeholder="Camry" value={model} onChange={(e) => setModel(e.target.value)} />
                </Field>
              </div>
              <Field label="Plate number">
                <TextInput
                  placeholder="RIV-123-XY"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                />
              </Field>
              <Field label="Transmission type">
                <Select
                  value={transmissionType}
                  onChange={(e) => setTransmissionType(e.target.value as "manual" | "automatic")}
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </Select>
              </Field>
              <div className="flex gap-2 mt-2">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setError(null);
                    if (!make || !model || !plateNumber) {
                      setError("Please fill in your vehicle's details.");
                      return;
                    }
                    setStep(3);
                  }}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-semibold text-paper mb-4">When do you need a driver?</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setScheduleMode("now")}
                  className={`border rounded-lg py-3 text-sm font-medium ${
                    scheduleMode === "now" ? "border-amber bg-amber/10 text-amber-strong" : "border-ink-border-strong text-paper-dim"
                  }`}
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleMode("later")}
                  className={`border rounded-lg py-3 text-sm font-medium ${
                    scheduleMode === "later" ? "border-amber bg-amber/10 text-amber-strong" : "border-ink-border-strong text-paper-dim"
                  }`}
                >
                  Schedule for later
                </button>
              </div>
              {scheduleMode === "later" && (
                <Field label="Pickup date & time">
                  <TextInput
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </Field>
              )}
              <div className="flex gap-2 mt-2">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button className="flex-1" loading={loading} onClick={goToConfirm}>
                  See fare estimate
                </Button>
              </div>
            </div>
          )}

          {step === 4 && fare && (
            <div>
              <h2 className="font-semibold text-paper mb-4">Confirm your booking</h2>
              <div className="bg-ink-950 rounded-xl p-4 mb-4 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-paper-dim">Base fare</span>
                  <span className="text-paper">₦{fare.baseFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-paper-dim">Distance ({fare.distanceKm} km)</span>
                  <span className="text-paper">₦{fare.distanceFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-paper-dim">Escort driver surcharge</span>
                  <span className="text-paper">₦{fare.escortSurcharge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-ink-border mt-1 font-semibold">
                  <span className="text-paper">Total</span>
                  <span className="text-paper">₦{fare.total.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-paper-faint mb-4">
                A second driver always accompanies your primary driver, at no extra step for you — it&apos;s built into
                every fare.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button className="flex-1" loading={loading} onClick={confirmBooking}>
                  Confirm booking
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function humanizeTripError(code?: string): string {
  switch (code) {
    case "identity_verification_required":
      return "Please finish identity verification before booking.";
    case "payment_method_required":
      return "Please add a payment method before booking.";
    case "validation_error":
      return "Please check your booking details and try again.";
    default:
      return "Something went wrong creating your booking. Please try again.";
  }
}
