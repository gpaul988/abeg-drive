import { MarketingShell } from "@/components/MarketingShell";

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <p className="text-amber text-sm font-mono mb-3 tracking-wide">LEGAL</p>
        <h1 className="text-3xl font-display font-semibold text-paper mb-2 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-paper-faint mb-10">Last updated: draft — pending formal legal review</p>

        <div className="text-paper-dim leading-relaxed space-y-6 text-sm">
          <p className="bg-amber/10 border border-amber/30 rounded-lg p-4 text-paper">
            This is a working draft prepared for the AbegDrive MVP launch, intended to align with the Nigeria Data
            Protection Act (NDPA). It has not yet been reviewed by qualified Nigerian legal counsel.
          </p>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">1. What we collect</h2>
            <p>We collect the information necessary to verify identity and safely operate a trip, including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Phone number, email, and password (hashed, never stored in plain text)</li>
              <li>National Identification Number (NIN) and, for drivers, Bank Verification Number (BVN)</li>
              <li>A selfie image used for liveness verification against your ID</li>
              <li>Vehicle details and, for drivers, license and guarantor information</li>
              <li>Trip location data (pickup, destination, and live GPS pings during a trip)</li>
              <li>Payment card tokenization data (we never store raw card numbers)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">2. Why we collect it</h2>
            <p>
              Identity verification exists specifically to prevent fraudulent and unsafe bookings. Trip location data
              is retained for twelve months to support dispute resolution and, where legally required, to cooperate
              with law enforcement. We do not use your data to sell advertising.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">3. Encryption and access</h2>
            <p>
              NIN, BVN, license numbers, and selfie images are encrypted at rest and in transit. Access to this data
              is logged. Administrative access to customer and driver records is restricted by role — for example,
              our Security Agent role can access live incident data but not financial or verification records.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">4. Who we share data with</h2>
            <p>
              We share the minimum necessary data with: identity verification providers (for NIN/BVN and liveness
              checks), payment processors (for card tokenization and charging), SMS providers (for OTP delivery), and
              law enforcement or regulators where legally compelled or as part of our voluntary road-safety
              compliance reporting.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">5. Data retention</h2>
            <p>
              Trip location data is retained for twelve months, then purged per our data retention schedule. Identity
              verification records are retained for as long as your account is active plus any period required by
              applicable regulation.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">6. Your rights</h2>
            <p>
              Under the NDPA, you may request access to, correction of, or deletion of your personal data, subject
              to our legal obligations to retain certain records. Contact Support to make a request.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">7. Changes to this policy</h2>
            <p>We'll communicate material changes in-app before they take effect.</p>
          </section>
        </div>
      </div>
    </MarketingShell>
  );
}
