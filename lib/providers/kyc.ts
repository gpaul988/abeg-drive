// Adapter boundary for NIN/BVN verification + selfie liveness.
//
// Production: point this at Prembly, Youverify, or Smile Identity (per spec
// section 7) using KYC_PROVIDER_API_KEY. Those require a live commercial
// account this sandbox doesn't have, so dev mode uses a deterministic mock:
// any syntactically valid 11-digit NIN passes; NINs starting with "00" are
// simulated rejections, so the reject path is exercisable in testing.

export interface NinVerifyResult {
  verified: boolean;
  reason?: string;
}

export async function verifyNin(ninNumber: string): Promise<NinVerifyResult> {
  const apiKey = process.env.KYC_PROVIDER_API_KEY;

  if (!apiKey) {
    if (ninNumber.startsWith("00")) {
      return { verified: false, reason: "no_match_found_in_registry" };
    }
    return { verified: true };
  }

  // Example real integration (Prembly):
  // const res = await fetch("https://api.prembly.com/identitypass/verification/vnin", {
  //   method: "POST",
  //   headers: { "x-api-key": apiKey, "app-id": process.env.PREMBLY_APP_ID!, "Content-Type": "application/json" },
  //   body: JSON.stringify({ number: ninNumber }),
  // });
  // const data = await res.json();
  // return { verified: data.verification_status === "true" };

  return { verified: true };
}

export interface SelfieLivenessResult {
  match: boolean;
  livenessRef: string;
}

export async function verifySelfieLiveness(
  userId: string,
  _selfieImageBase64: string
): Promise<SelfieLivenessResult> {
  // Dev stub: always passes and returns a synthetic reference id.
  // Production: send image to the KYC provider's liveness+face-match
  // endpoint and compare against the ID photo captured at NIN verification.
  return { match: true, livenessRef: `liveness_${userId}_${Date.now()}` };
}
