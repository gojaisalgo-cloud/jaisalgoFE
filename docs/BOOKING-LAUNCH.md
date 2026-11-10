# Book now and real payment launch — 4 November 2026

The public booking experience now uses **Book now**, a visible **₹99 now / balance at check-in or on the visit date** promise, and call assistance at **8824548099** (`tel:+918824548099`). Name and mobile remain the only required customer contact fields; a different WhatsApp number and a special request are optional and collapsed. No email or account is added.

## Implemented

- Homepage, package cards, package details and ready checkout use Book now. The ₹99 amount stays beside the action and is deducted from the full group total.
- The large demo-experience banner was replaced with a compact payment explanation. Only explicitly configured demo/test environments carry a truthful testing label.
- Live is now the default mode. Missing or mistyped configuration cannot silently select demo or simulate a reservation. Existing explicit demo/test workflows remain available for isolated QA.
- Call assistance appears in checkout, unavailable-payment fallback, tickets and the footer. The supplied number is used for voice calls; WhatsApp remains a separate optional configuration.
- Tickets show total, paid amount, remaining balance, payment timing, trip date/group, booking reference and QR. Download/share and My Bookings retain their existing private access behavior. The downloaded PNG also includes assistance contact and balance timing.
- If shared storage or payment credentials are missing, the page offers call assistance rather than taking details or pretending payment succeeded. Supplier review, payment verification, inventory holds, duplicate-payment checks, refund rules and receipt-backed offline balances remain enforced.

## Required to accept actual money

The inspected checkout had no hosted database, Razorpay credentials or business-name configuration. All 24 published seed packages remained unreviewed for supplier/tax approval, and no live departures were configured. These are business/hosting inputs; they cannot be fabricated by changing a label.

1. Create/connect the hosted libSQL database described in [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md). Save `DATABASE_URL` and `DATABASE_AUTH_TOKEN` privately in Vercel's Production environment. A local SQLite file is not production inventory storage.
2. Complete Razorpay merchant onboarding for the actual business and website. Put the matching live `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` in server environment variables. Never send secrets in chat or commit them. Confirm `BOOKING_MODE=live`; remove an old explicit `demo` setting if present.
3. Configure the webhook at `https://www.jaisalgo.com/api/payments/webhook` for captured/failed/refunded payments, using the same signing secret. The existing server verifies signatures, provider-owned order/amount/currency and captured status before a booking/ticket is issued. Set up/test payment capture using the provider's supported workflow.
4. Set the actual `BOOKING_BUSINESS_NAME`. In the existing authenticated travel desk, review each package's actual supplier costs, applicable tax model, cancellation/refund terms and required venue. Enter actual available dates/capacities in **live** mode. No seed price, property, availability or tax approval is inferred.
5. Redeploy and validate persistence, provider verification, ticket access and refunds in a separate test environment before accepting customers. The test suite uses isolated databases and mocked provider/test settlement; it does not prove merchant activation or a real payment succeeded.

Official setup references: [Razorpay Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps), [Razorpay API keys](https://razorpay.com/docs/payments/dashboard/account-settings/api-keys). Actual live keys are required for real customer payment collection; test keys remain simulations.

## Customer journey

Package → **Book now** → date/travellers → full group total and a choice of ₹99 now or full payment → essential name/mobile and accepted terms → verified payment → ticket. The balance is not collected in advance; online balance payment remains unavailable until the visit date. An offline check-in/day-of-visit payment needs the existing operator receipt before the balance can be marked paid.

Live payment failure/pending status never produces a successful ticket. Returning customers open My Bookings on the same device or their private ticket link. A QR opens a separate verification page with current status and no customer contact details; admission/location claims require the real operator's confirmed data.

## Validation

82 automated tests pass, including full-payment totals and settlement, immutable retry intent, optional contact validation, private PDF authorization, QR privacy/refund updates and full-payment analytics. Typecheck, production build and isolated admin HTTP integration passed. Browser checks and deployment evidence are recorded in the external delivery output. Demo/test validation remains explicitly separate from actual merchant readiness.

## Reference-inspired booking update

The existing one-page checkout now has three clear progress stages, two large payment-choice cards, an arrival-balance summary and a sticky Book now action. The default remains ₹99. Full payment creates a server-priced order for the complete accepted package quote, without an invented discount, and confirms the existing booking ID as fully paid after capture verification. Existing initial drafts retain their internal `kind=token` for compatibility; the additive `paymentPlan` distinguishes token/full payment. Missing legacy values mean token.

Ticket download now uses an authenticated, same-origin POST to `/api/booking/ticket` and returns a server-generated, noncached PDF with the current ledger amounts, support number, reporting details, QR, itinerary, inclusion summary and cancellation terms. The existing PNG download remains available as Save ticket image. Private sharing and account-free retrieval remain available. Share on WhatsApp opens a draft link; it does not automatically send a message.

QR verification uses an independent opaque capability at `/verify/[token]`. It shows booking reference, package, date, group size and current status; it never returns the name, contact, payment reference or private ticket access key. The token is indexed by hash. Existing bookings receive this verification capability lazily under private authorization. Refund/cancellation changes appear at verification time. Verification routes are noindex and excluded from replay/heatmaps; analytics URLs redact the token.

Admins can search by booking ID, name, mobile, package or date, filter active/payment/review records, inspect receipt history and pending/failed attempts, and save reporting/pickup/arrival instructions. Operational changes cannot mark an unverified payment successful or change the paid amount. Online balance payment retains the accepted check-in/visit-date policy and uses the existing order/idempotence checks.

Browser verification used an isolated local database with explicit demo mode, not production money: both full and ₹99 checkout succeeded, a three-traveller selection persisted across refresh, PDF downloaded, the limited QR page omitted contact data, My Bookings reopened the ticket, and early balance payment remained disabled. The downloaded A5 PDF was rendered and visually checked across all three pages. Test/production source builds, typecheck, 82 tests and the isolated authenticated admin HTTP suite passed. Production dependency audit reports no known vulnerabilities. Repository lint retains pre-existing issues; this is not claimed as a clean lint run.

Production merchant/database/supplier setup above is still required. This update does not activate a payment account, invent approved inventory or bypass live-payment safeguards.


## Open-date reservations

Set `BOOKING_DEFAULT_CAPACITY=unlimited` to accept reservations without a daily traveler limit for package dates without an individual capacity entry. This is the owner-selected operating policy, not a claim of supplier-confirmed room or vehicle inventory. The existing valid travel-date range still applies. Set a per-date departure capacity in the travel desk to override this default; zero closes a date. A numeric default of 1–100 is also supported and accounts for active holds and bookings. Blank or invalid values require individual departure entries and display a confirmation request rather than a sold-out message. Demo mode retains its separate simulated capacity.

The same policy is checked when creating an order, retrying it and fulfilling a captured payment. A subsequently closed date, insufficient remaining places or an expired hold puts a captured payment into refund review instead of issuing a ticket. Open dates do not approve supplier costs, tax treatment, venues or refund terms. Those existing paid-checkout requirements still apply. Set the capacity value in Vercel Production and deploy to apply it there.


## ₹99 reservations before supplier confirmation

The owner enabled paid ₹99 reservations while supplier arrangements are pending. Live token orders still require a configured Razorpay gateway, a seller name, customer consent, a valid future date and an available date under the configured booking policy. The order amount is always 9,900 paise, priced and verified by the server. Full-package payment retains the supplier, tax, final-terms, priced-options and venue checks.

For a pending package, checkout offers the ₹99 option and displays the reservation policy from `lib/booking/reservation-policy.ts`, replacing seed/demo terms. The policy states that the ₹99 is credited to the trip total, supplier arrangements and final price are confirmed afterward, changes need customer agreement before further payment, and the reservation amount is refunded if JaisalGo cannot confirm the trip. Refunds use the existing operator review and Razorpay reconciliation process.

The accepted policy and `confirmationPending` state are saved with the order and booking. The paid reservation ticket and public QR state that supplier confirmation is pending; they do not mark supplier/tax/venue records approved. A captured, verified ₹99 payment records the reservation once. Balance payment for such reservations requires reviewed arrangements and an unchanged accepted package total, in addition to the existing travel-date rule. Financial analytics records the verified ₹99 reservation without treating pending supplier arrangements as a confirmed trip.
