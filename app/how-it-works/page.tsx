import Link from "next/link";
import { MarketingShell, PageHeader } from "@/components/MarketingShell";

const STEPS = [
  {
    n: "01",
    title: "Book your ride",
    body: "Open the app, drop a pin for your pickup and destination, and tell us about your vehicle — make, model, and whether it's manual or automatic. We match drivers to the transmission you actually drive.",
  },
  {
    n: "02",
    title: "Two drivers are dispatched",
    body: "A primary driver is matched to take your car's wheel, and an escort driver is matched alongside them — either following in a company vehicle or arriving to return the primary driver to base. You never ride with a lone, unaccompanied driver.",
  },
  {
    n: "03",
    title: "Your driver arrives and verifies",
    body: "Your primary driver arrives at your pickup point and completes a selfie liveness check against their driver profile before the trip starts — confirming the person who showed up is the person we vetted.",
  },
  {
    n: "04",
    title: "You're tracked, live, the whole way",
    body: "Every trip streams a live location to your tracking screen. Generate a share link and send it to someone you trust — no login required for them to watch along.",
  },
  {
    n: "05",
    title: "Panic button, always one tap away",
    body: "If anything feels wrong, the panic button on your tracking screen alerts our security response team immediately — targeting a response within seconds, not minutes.",
  },
  {
    n: "06",
    title: "Arrive, rate, done",
    body: "Your car is parked safely at your destination. Rate your driver, get an itemized receipt, and your trip history is there whenever you need it.",
  },
];

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <PageHeader
        eyebrow="HOW IT WORKS"
        title="A ride home, without ever letting go of your own car."
        subtitle="AbegDrive doesn't drive you somewhere in a stranger's car — we send a vetted team to drive your car, with you in it, all the way home."
      />

      <div className="max-w-3xl mx-auto px-4 pb-20">
        <div className="space-y-10">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-6">
              <p className="font-mono text-sm text-paper-faint w-8 shrink-0 pt-1">{step.n}</p>
              <div>
                <h2 className="font-display font-semibold text-paper text-lg mb-2">{step.title}</h2>
                <p className="text-paper-dim leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-ink-900 border border-ink-border rounded-xl p-6 text-center">
          <p className="text-paper font-display font-medium mb-2">Ready to try it?</p>
          <p className="text-sm text-paper-dim mb-4">
            Sign-up takes about five minutes — phone verification, ID check, and a payment method on file, once, and
            you're set for every future ride.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-amber hover:bg-amber-strong text-ink-950 px-6 py-2.5 rounded-lg font-semibold"
          >
            Create your account
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
