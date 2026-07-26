import type { NextConfig } from "next";

// Security headers applied to every response. Next.js's own inline critical
// CSS means style-src needs 'unsafe-inline' — a real tradeoff, not an
// oversight; a stricter CSP would need a nonce-based setup wired through
// Next's App Router rendering, which is a larger change than this pass.
// script-src omits 'unsafe-inline'/'unsafe-eval' since this app has no
// inline scripts and doesn't need eval.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "media-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(self)" },
  // HSTS only matters over real HTTPS in production; harmless to send in
  // dev since browsers ignore it on http://localhost.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
