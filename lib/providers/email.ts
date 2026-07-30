// Adapter boundary for email delivery, mirroring lib/providers/sms.ts.
// Production would use a real provider (SendGrid, Postmark, AWS SES). No
// credentials exist in this sandbox, so this dev implementation logs the
// code instead of sending it.

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.log(`[dev email stub] Verification code for ${email}: ${code}`);
    return;
  }

  // Example real integration (SendGrid):
  // await fetch("https://api.sendgrid.com/v3/mail/send", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     personalizations: [{ to: [{ email }] }],
  //     from: { email: "noreply@abegdrive.ng", name: "AbegDrive" },
  //     subject: "Verify your email",
  //     content: [{ type: "text/plain", value: `Your verification code is ${code}` }],
  //   }),
  // });
}
