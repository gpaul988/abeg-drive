// Adapter boundary for SMS/OTP delivery.
//
// Production: swap the body of sendOtpSms for a real Termii or Africa's
// Talking API call (both are Nigerian-market REST APIs, per spec section 7).
// Requires TERMII_API_KEY / AT_API_KEY env vars — not available in this
// sandbox, so this dev implementation logs the OTP instead of sending it.
// The function signature is the integration point; nothing above this layer
// needs to change when a real key is added.

export async function sendOtpSms(phone: string, code: string): Promise<void> {
  const apiKey = process.env.TERMII_API_KEY;

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.log(`[dev sms stub] OTP for ${phone}: ${code}`);
    return;
  }

  // Example real integration (Termii):
  // await fetch("https://api.ng.termii.com/api/sms/otp/send", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     api_key: apiKey,
  //     message_type: "NUMERIC",
  //     to: phone,
  //     from: "SafeKeys",
  //     channel: "generic",
  //     pin_attempts: 3,
  //     pin_time_to_live: 5,
  //     pin_length: 6,
  //   }),
  // });
}
