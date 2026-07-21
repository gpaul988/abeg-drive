# SafeKeys

Designated driver service for Port Harcourt, Rivers State, Nigeria. A customer
who can't safely drive books a professional driver who arrives and drives the
customer's own vehicle home, with a two-driver dispatch model (primary +
escort) for safety.

Built with Next.js (App Router) — API routes under `app/api/v1/*` serve as the
backend, pages under `app/*` serve as the frontend, per the full specification
in `SPEC.md`.

## Status

This is being built module by module. Current progress:

- Auth module — signup, OTP verification, NIN + selfie-liveness identity
  verification, payment-method tokenization, login, refresh tokens,
  forgot/reset password. Full funnel tested end-to-end.
- Trips module — booking flow, live tracking, panic button, dispatch
  matching. Not yet started.
- Admin module — verification queue, incidents, bond fund, reports.
  Not yet started.
- Corporate / Venue Partner modules — not yet started.

## Running locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Start at `/signup` to walk the full onboarding
funnel: phone/email/password -> OTP -> NIN -> selfie liveness -> payment
method -> dashboard.

### Dev-mode stubs

No third-party accounts are wired up yet, so these run against safe stubs
until real API keys are added via `.env.local` (see `.env.example`):

| Concern | Dev behavior | Production integration |
|---|---|---|
| SMS/OTP delivery | OTP code is printed to the server console log | Termii or Africa's Talking |
| NIN verification | Any valid 11-digit NIN passes; NINs starting `00` simulate a rejection | Prembly / Youverify / Smile Identity |
| Selfie liveness | Always passes, returns a synthetic reference id | Same KYC provider's liveness+face-match endpoint |
| Card tokenization | Deterministic mock token, no real card data leaves the server | Paystack (primary) / Flutterwave (fallback) |
| Database | JSON file at `data/db.json` via a repository-pattern layer (`lib/repositories/`) | PostgreSQL + PostGIS — swap the implementation in `lib/db.ts` / `lib/repositories/*`, no route or page changes needed |

Each stub lives behind an adapter in `lib/providers/` — the function
signature is the integration point; only the internals change when real keys
are available.

## Architecture notes

- All persistence goes through `lib/repositories/*` — never touch `lib/db.ts`
  directly from a route.
- Auth: bcrypt password hashing, short-lived JWT access tokens (15 min) +
  long-lived opaque refresh tokens (30 days) stored server-side so they can be
  revoked.
- Validation: all API input is validated with `zod` schemas in
  `lib/validation.ts`, returning `400 validation_error` with field-level
  detail on failure.
- `POST /api/v1/auth/onboarding-token` is an internal-only endpoint (not in
  the original spec's list) added to bridge the multi-step signup funnel into
  an authenticated session without re-prompting for the password mid-flow.

## Full specification

See `SPEC.md` for the complete build brief this project implements (all
pages, roles, data model, API surface, and Nigeria-specific safety
requirements).
