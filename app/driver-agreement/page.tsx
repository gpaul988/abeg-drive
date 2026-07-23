import { MarketingShell } from "@/components/MarketingShell";

export default function DriverAgreementPage() {
  return (
    <MarketingShell>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <p className="text-amber text-sm font-mono mb-3 tracking-wide">LEGAL</p>
        <h1 className="text-3xl font-display font-semibold text-paper mb-2 tracking-tight">Driver Agreement</h1>
        <p className="text-sm text-paper-faint mb-10">Last updated: draft — pending formal legal review</p>

        <div className="text-paper-dim leading-relaxed space-y-6 text-sm">
          <p className="bg-amber/10 border border-amber/30 rounded-lg p-4 text-paper">
            This is a working draft prepared for the AbegDrive MVP launch. It has not yet been reviewed by qualified
            Nigerian legal counsel and should not be treated as final until that review is complete.
          </p>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">1. Independent contractor status</h2>
            <p>
              As a driver on AbegDrive, you operate as an independent contractor, not an employee. You control your
              own schedule by going online or offline at will, subject to the vetting and probation terms below.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">2. Verification requirements</h2>
            <p>Before you can accept your first trip, you must complete:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>NIN and BVN verification, and a selfie liveness check</li>
              <li>Submission of a valid driver&apos;s license and its expiry date</li>
              <li>A guarantor reference (name, phone, and relationship)</li>
              <li>Consent to a background check</li>
              <li>Manual review and approval by our operations team — no application is auto-approved</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">3. The two-driver model</h2>
            <p>
              Every trip you accept as a primary driver is paired with an escort driver, and every trip you accept
              as an escort supports a primary driver. This is not optional per-trip — it is how AbegDrive operates
              by design, for your safety and the customer&apos;s.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">4. Probation period</h2>
            <p>
              Your first several trips are ops-monitored under a probation status before you graduate to full
              standing. This lets our team confirm real-world performance matches your application before you have
              unrestricted access to the platform.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">5. Vehicle handling</h2>
            <p>
              You are responsible for the reasonable care of any customer vehicle while it is in your control,
              reporting any pre-existing damage before a trip begins, and reporting any incident immediately through
              the app or the panic button.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">6. Start-of-trip verification</h2>
            <p>
              As the primary driver, you must complete a selfie liveness check immediately before starting each
              trip. This confirms to the customer, and to us, that the verified driver is the one behind the wheel.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">7. Payouts</h2>
            <p>
              Earnings are paid out to the bank account linked at onboarding. Payout timing and any applicable
              platform fee will be disclosed in your driver dashboard.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">8. Suspension and termination</h2>
            <p>
              AbegDrive may suspend or terminate your account for safety violations, customer complaints found
              credible on review, falsified application information, or failure to maintain valid license and
              background check status.
            </p>
          </section>
        </div>
      </div>
    </MarketingShell>
  );
}
