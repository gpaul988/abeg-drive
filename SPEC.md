# Full-Stack MVP Specification Prompt
## "SafeKeys" — Designated Driver Service for Port Harcourt, Rivers State, Nigeria

> Use this document as a build prompt for an AI coding assistant, a development team, or as your own engineering brief. It specifies every page, role, API, and safeguard needed for a production-ready MVP.

---

## 1. PRODUCT OVERVIEW

**What it is:** A web + mobile-responsive platform where a customer who cannot safely drive (drunk, tired, sick, post-event) books a professional driver who comes to their location and drives the **customer's own vehicle** to their destination — modeled on Dryver/BeMyDD (US) and Kakao T 대리 (South Korea) — adapted with trust, safety, and insurance mitigations for the Rivers State / Nigerian market.

**Core mechanic:** Two-driver dispatch model.
- **Driver A** arrives, drives the customer's car to the destination.
- **Driver B** (backup/escort) either follows in a company vehicle or arrives separately to return Driver A to base — mirrors the proven US operational model and adds a built-in safety-in-numbers layer relevant to Rivers State security concerns.

**Phase 1 launch strategy (per prior risk analysis):** Do NOT launch as an open consumer dispatch app. Launch narrow:
- Whitelisted partner venues only (hotels, event centers, lounges/bars, corporate clients)
- Pre-verified customers (ID + card on file) before first booking
- Corporate/B2B accounts (oil & gas companies, banks) as an anchor revenue segment
- Expand to open consumer dispatch only after driver pool, insurance/bond fund, and security partnerships are proven

---

## 2. USER ROLES

1. **Customer** — books a driver for themselves/their vehicle
2. **Driver (Primary)** — operates the customer's vehicle
3. **Driver (Escort/Backup)** — follows/returns primary driver; also serves as safety witness
4. **Corporate Admin** — manages a company account, employee bookings, billing
5. **Venue Partner** — hotel/event center/bar staff who can request drivers on behalf of guests
6. **Platform Admin (Ops)** — internal team managing verification, disputes, dispatch oversight, bond fund
7. **Super Admin** — full system access, financial reporting, compliance exports

---

## 3. FULL PAGE / SCREEN INVENTORY

### 3.1 Public / Marketing
- `/` — Landing page (value prop, "how it works," safety features, pricing preview, CTA to sign up)
- `/how-it-works`
- `/safety` — dedicated trust & safety page (verification process, insurance/bond explanation, panic button, tracking) — critical for Nigerian market trust-building
- `/pricing`
- `/corporate` — B2B landing page for oil & gas / bank / enterprise clients
- `/partners` — venue partner sign-up page (hotels, event centers, bars)
- `/faq`
- `/terms`, `/privacy`, `/driver-agreement`

### 3.2 Auth (Customer)
- `/signup` — phone number + email
- `/signup/verify-otp` — SMS OTP (Nigerian telco compatible: Termii/Africa's Talking)
- `/signup/identity` — NIN input + selfie liveness capture (mandatory before first booking)
- `/signup/payment-method` — card tokenization via Paystack/Flutterwave (mandatory before booking — removes anonymity, a core risk mitigation)
- `/login`
- `/forgot-password`

### 3.3 Customer App (Web)
- `/dashboard` — book now, upcoming bookings, recent trips
- `/book` — booking flow:
  - Step 1: Pickup location (map picker) + destination(s), multi-stop support
  - Step 2: Vehicle details (make/model, transmission type — manual/automatic — captured for driver matching)
  - Step 3: Schedule now vs. later
  - Step 4: Fare estimate + confirm
- `/book/tracking/:tripId` — live map, driver photo/name/rating, ETA, **panic button**, share-trip link generator
- `/trip/:tripId/receipt`
- `/trip-history`
- `/profile` — personal info, saved vehicles, ID verification status
- `/profile/emergency-contacts` — required field, used for share-trip and incident escalation
- `/payment-methods`
- `/support` — chat/ticket + emergency hotline number prominently displayed
- `/refer` (optional growth loop)

### 3.4 Driver App (Web, mobile-responsive; consider PWA)
- `/driver/signup` — application form
- `/driver/onboarding`:
  - NIN + BVN verification
  - Driver's license upload + verification against FRSC database (or manual verification queue in MVP)
  - Guarantor details (name, phone, relationship) — community trust mechanism
  - Address verification (physical visit scheduling in MVP; flagged for ops team)
  - Background check consent
  - Bank account for payout (Paystack/Flutterwave subaccount)
  - Vehicle competency selection (manual/automatic, SUV/sedan/etc.)
- `/driver/probation-status` — shows trial period progress (first N trips are ops-monitored)
- `/driver/dashboard` — go online/offline toggle, earnings summary, next trip
- `/driver/trip/:tripId` — accept/decline, navigation, in-trip status updates, **panic button**
- `/driver/trip/:tripId/start-verification` — selfie liveness match before trip starts (confirms correct driver shows up)
- `/driver/earnings`
- `/driver/ratings`
- `/driver/documents` — renewal reminders for license/insurance docs
- `/driver/training` — safety and customer-handling microlearning modules (checklist-based for MVP)

### 3.5 Corporate Admin Portal
- `/corporate/signup`
- `/corporate/dashboard` — employee usage overview, spend summary
- `/corporate/employees` — add/remove employees, set booking limits/policies
- `/corporate/billing` — invoices, payment terms
- `/corporate/reports` — export usage/compliance reports (relevant for oil & gas safety policy compliance)

### 3.6 Venue Partner Portal
- `/partner/signup`
- `/partner/dashboard` — request driver on behalf of a guest, view active requests
- `/partner/co-branding` — (Phase 2) promotional material for "safe ride home" campaigns

### 3.7 Admin / Ops Dashboard (Internal)
- `/admin/login` (with 2FA mandatory)
- `/admin/dashboard` — live trip map, active drivers, flagged incidents
- `/admin/verifications` — queue for manual ID/license/address verification approvals
- `/admin/drivers` — full driver directory, probation tracking, ratings, suspension tools
- `/admin/customers` — customer directory, flagged accounts (fraud/no-shows)
- `/admin/trips` — full trip log, dispute resolution tools
- `/admin/incidents` — panic button alerts, escalation workflow, resolution logging
- `/admin/bond-fund` — tracks the self-funded reserve pool (% of each trip fee) used as an interim insurance mechanism; balance, claims paid, claims pending
- `/admin/pricing` — configure fare rules, surge (or explicitly no-surge policy), corporate rates
- `/admin/venues` — manage whitelisted partner venues
- `/admin/reports` — financial, safety, compliance reporting (for regulators, insurers, investors)
- `/admin/audit-log` — immutable log of all admin actions (compliance requirement)

---

## 4. DATA MODEL (Core Entities)

```
User (base)
 ├─ id, phone, email, password_hash, role, created_at
 ├─ nin_number (encrypted), bvn_number (encrypted)
 ├─ verification_status (pending/verified/rejected)
 └─ selfie_liveness_ref

Customer (extends User)
 ├─ emergency_contacts[]
 ├─ saved_vehicles[] (make, model, plate_number, transmission_type)
 ├─ payment_method_token
 └─ trust_score (no-show/cancellation history)

Driver (extends User)
 ├─ license_number, license_expiry, license_doc_ref
 ├─ guarantor_name, guarantor_phone, guarantor_relationship
 ├─ vehicle_competency[] (manual, automatic, SUV, etc.)
 ├─ probation_status, trips_completed
 ├─ rating_avg
 ├─ bank_payout_subaccount_id
 └─ background_check_status

CorporateAccount
 ├─ company_name, RC_number, billing_contact
 ├─ employees[] (linked Customer ids)
 └─ policy_settings (spend limits, allowed hours)

VenuePartner
 ├─ venue_name, address, contact_person
 └─ co_branding_assets[]

Trip
 ├─ id, customer_id, driver_primary_id, driver_escort_id
 ├─ pickup_location, destination(s), scheduled_time
 ├─ vehicle_details_snapshot
 ├─ status (requested/matched/en_route/in_progress/completed/cancelled/incident)
 ├─ fare_amount, payment_status
 ├─ live_location_pings[] (timestamped GPS trail — retained for dispute resolution)
 ├─ share_trip_link_token
 ├─ start_selfie_match_result
 └─ rating_customer_to_driver, rating_driver_to_customer

Incident
 ├─ trip_id, triggered_by (customer/driver), type (panic/accident/dispute/no-show)
 ├─ status (open/investigating/resolved)
 ├─ resolution_notes
 └─ escalated_to_security_partner (bool)

BondFundLedger
 ├─ trip_id, contribution_amount, running_balance
 └─ claim_id (nullable, links to Incident/claim payout)

Payment
 ├─ trip_id, provider (Paystack/Flutterwave), amount, status, reference
```

---

## 5. API ENDPOINTS (REST, versioned `/api/v1`)

### Auth & Identity
- `POST /auth/signup`
- `POST /auth/verify-otp`
- `POST /auth/login`
- `POST /auth/identity/nin-verify` — integrates NIMC verification API (or licensed KYC aggregator e.g. Youverify, Prembly, Smile Identity — common in Nigerian fintech stacks)
- `POST /auth/identity/selfie-liveness` — liveness check against ID photo
- `POST /auth/refresh-token`

### Customer
- `GET /customers/me`
- `PUT /customers/me`
- `POST /customers/me/vehicles`
- `POST /customers/me/emergency-contacts`
- `POST /customers/me/payment-methods`

### Driver
- `POST /drivers/apply`
- `POST /drivers/documents` — license, guarantor info
- `GET /drivers/me/probation-status`
- `PUT /drivers/me/availability` (online/offline)
- `POST /drivers/me/trips/:tripId/accept`
- `POST /drivers/me/trips/:tripId/decline`
- `POST /drivers/me/trips/:tripId/start-selfie-verify`
- `POST /drivers/me/trips/:tripId/location-ping`

### Trips
- `POST /trips` — create booking (fare estimate returned)
- `GET /trips/:id`
- `GET /trips/:id/tracking` — live location, ETA, driver info
- `POST /trips/:id/panic` — triggers Incident + security partner escalation
- `POST /trips/:id/share-link` — generates shareable tracking link (no login required to view)
- `POST /trips/:id/cancel`
- `POST /trips/:id/rate`
- `GET /trips/:id/receipt`

### Corporate
- `POST /corporate/signup`
- `GET /corporate/:id/employees`
- `POST /corporate/:id/employees`
- `GET /corporate/:id/billing`
- `GET /corporate/:id/reports`

### Venue Partner
- `POST /partner/signup`
- `POST /partner/request-driver` — book on behalf of a guest

### Payments
- `POST /payments/charge` — Paystack/Flutterwave integration
- `POST /payments/webhook` — provider callback handler
- `GET /payments/:tripId/status`

### Admin/Ops
- `GET /admin/verifications/queue`
- `POST /admin/verifications/:userId/approve`
- `POST /admin/verifications/:userId/reject`
- `GET /admin/incidents`
- `PUT /admin/incidents/:id`
- `GET /admin/bond-fund/balance`
- `POST /admin/bond-fund/claims/:incidentId/payout`
- `GET /admin/reports/compliance-export`
- `GET /admin/audit-log`

### Matching/Dispatch Engine
- `POST /dispatch/match` — internal service: matches trip request to nearest available primary + escort driver pair based on vehicle competency, rating, probation status
- `GET /dispatch/venues/whitelist` — Phase 1 restriction check

---

## 6. NIGERIA/RIVERS-STATE-SPECIFIC SAFEGUARDS (build these in, not bolt-on)

| Risk (from prior analysis) | MVP Implementation |
|---|---|
| Fake bookings / robbery setups | Mandatory NIN + selfie liveness + card-on-file before first booking; no cash-only anonymous bookings; first-time late-night bookings routed to manual ops verification call before dispatch |
| Driver theft / vehicle risk | Two-driver dispatch model; live GPS trail retained; start-of-trip selfie match; guarantor requirement at onboarding |
| No insurance product available | `BondFundLedger` — small % of every trip fee auto-allocated to a claims reserve; admin claims workflow; structure as a placeholder until a formal insurtech partnership (e.g. Casava, Curacel-powered underwriter) is signed |
| Weak driver vetting pipeline | Probation status field + ops-monitored first N trips; guarantor contact; address verification flag for manual field visit |
| Regulatory uncertainty | `admin/reports/compliance-export` built early — designed to hand data to Rivers State Ministry of Transportation / FRSC proactively, positioning the platform as a road-safety partner |
| Low willingness-to-pay (consumer) | Corporate account and Venue Partner modules built as first-class citizens, not afterthoughts — B2B is the anchor revenue path |
| Cultural unfamiliarity | `/safety` and `/how-it-works` public pages designed for trust education; co-branding module for venue partners to promote "safe ride home" |

---

## 7. TECH STACK RECOMMENDATION

- **Frontend:** Next.js (React) — SSR for marketing/SEO pages, CSR for app; Tailwind CSS; mobile-responsive/PWA-installable (defer native apps to post-MVP)
- **Backend:** Node.js (Express or NestJS) — REST API as specified above; NestJS preferred for the module structure (auth, trips, drivers, admin as separate modules) given team familiarity with full-stack JS
- **Database:** PostgreSQL (relational integrity needed for trips/payments/compliance); PostGIS extension for geo-queries (nearest-driver matching)
- **Real-time:** WebSockets (Socket.io) for live trip tracking and dispatch matching
- **Auth:** JWT + refresh tokens; 2FA (TOTP) mandatory for Admin roles
- **KYC/Identity:** Prembly, Youverify, or Smile Identity API (NIN/BVN verification + liveness — all have Nigerian-market REST APIs)
- **Payments:** Paystack primary, Flutterwave fallback (both support Nigerian cards/bank transfer/USSD)
- **SMS/OTP:** Termii or Africa's Talking
- **Maps/Geo:** Google Maps Platform (Directions, Places, Geocoding) — best PH/Rivers State coverage; Mapbox as cost-saving alternative
- **File/Image storage:** AWS S3 or Cloudinary (license docs, selfies — encrypted at rest)
- **Hosting:** AWS or a Nigeria-latency-conscious provider (consider AWS af-south-1 Cape Town region for lower latency than US/EU regions)
- **Monitoring:** Sentry (errors), simple uptime monitor for MVP

---

## 8. NON-FUNCTIONAL REQUIREMENTS

- All PII (NIN, BVN, license numbers, selfies) encrypted at rest and in transit; access logged
- Nigeria Data Protection Act (NDPA) compliance for data handling and consent flows
- Audit log immutability for all admin actions (compliance/dispute evidence)
- Trip location data retained for a defined period (e.g. 12 months) for dispute resolution, then purged per data retention policy
- Panic button must have <5 second response SLA to trigger ops/security escalation
- System must degrade gracefully on poor connectivity (common in parts of Rivers State) — offline-tolerant trip status caching on driver app

---

## 9. MVP SCOPE CUT (what to explicitly defer post-launch)

- Native iOS/Android apps (PWA sufficient for MVP)
- Open consumer dispatch outside whitelisted venues
- Automated FRSC license database integration (manual verification queue acceptable for MVP)
- Full insurtech underwriting partnership (bond fund as interim mechanism)
- Multi-city expansion (Port Harcourt only for MVP)
- In-app chat (phone-based support acceptable initially)

---

**End of specification.** This document is written as a complete build brief — every page, entity, API, and Nigeria-specific safeguard discussed is included so a development team or AI coding assistant can proceed directly to implementation without missing scope.
