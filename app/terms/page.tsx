import { MarketingShell } from "@/components/MarketingShell";

export default function TermsPage() {
  return (
    <MarketingShell>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <p className="text-amber text-sm font-mono mb-3 tracking-wide">LEGAL</p>
        <h1 className="text-3xl font-display font-semibold text-paper mb-2 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-paper-faint mb-10">Last updated: draft — pending formal legal review</p>

        <div className="prose-sm text-paper-dim leading-relaxed space-y-6 text-sm">
          <p className="bg-amber/10 border border-amber/30 rounded-lg p-4 text-paper">
            This is a working draft prepared for the AbegDrive MVP launch. It has not yet been reviewed by qualified
            Nigerian legal counsel and should not be treated as final or binding until that review is complete.
          </p>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">1. What AbegDrive is</h2>
            <p>
              AbegDrive connects customers who need a driver for their own vehicle with a two-person driver team: a
              primary driver who operates the customer&apos;s vehicle, and an escort driver who accompanies the trip.
              AbegDrive is a technology platform that facilitates this connection; drivers are engaged as independent
              contractors, not employees, unless a separate written agreement states otherwise.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">2. Eligibility and verification</h2>
            <p>
              Use of AbegDrive requires phone verification, National Identification Number (NIN) verification,
              selfie liveness confirmation, and a valid payment method on file before a first booking. AbegDrive may
              suspend or refuse service to any account where verification cannot be completed or is found to be
              fraudulent.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">3. Customer responsibilities</h2>
            <p>
              You are responsible for the accuracy of the vehicle and location details you provide, for ensuring
              your vehicle is roadworthy and appropriately licensed, and for treating drivers with the same respect
              you&apos;d expect in return. Abusive behavior toward drivers may result in account suspension.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">4. Fares and payment</h2>
            <p>
              Fares are calculated and shown to you before you confirm a booking, based on a base fare, per-kilometer
              distance charge, and a fixed escort-driver charge. Payment is collected via the card on file at trip
              completion. Disputed charges can be raised through Support and are reviewed by our operations team.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">5. Cancellations</h2>
            <p>
              You may cancel a trip before it is completed. Repeated late cancellations or no-shows affect your
              account&apos;s trust score and may result in restricted access to booking.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">6. The bond fund is not insurance</h2>
            <p>
              A percentage of every trip fare is allocated to an internal bond fund used at AbegDrive&apos;s discretion
              to address covered incidents. This is an interim, self-funded mechanism, not a licensed insurance
              product, until a formal underwriting partnership is in place. See our Safety page for detail.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">7. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by applicable Nigerian law, AbegDrive&apos;s liability for any claim
              arising from use of the platform is limited to the fare paid for the trip giving rise to the claim,
              except where liability cannot be limited by law.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">8. Changes to these terms</h2>
            <p>
              We may update these terms as the service evolves. Material changes will be communicated in-app before
              they take effect.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-paper text-lg mb-2">9. Governing law</h2>
            <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>
          </section>
        </div>
      </div>
    </MarketingShell>
  );
}
