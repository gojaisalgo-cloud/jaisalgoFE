# Book now and real payment launch — 4 November 2026

The public booking experience now uses **Book now**, a visible **₹99 now / balance at check-in or on the visit date** promise, and call assistance at **8824548099** (`tel:+918824548099`). Name and mobile remain the only customer contact fields. No email or account is added.

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

Package → **Book now** → date/travellers → full group total, ₹99 now and remaining amount → essential name/mobile and accepted terms → verified payment → ticket. The balance is not collected in advance; online balance payment remains unavailable until the visit date. An offline check-in/day-of-visit payment needs the existing operator receipt before the balance can be marked paid.

Live payment failure/pending status never produces a successful ticket. Returning customers open My Bookings on the same device or their private ticket link. A QR opens the booking record; admission/location claims require the real operator's confirmed data.

## Validation

75 automated tests pass, including the new default-mode/wrong-key/mistyped-environment regression. Typecheck, production build and isolated admin HTTP integration passed. Browser checks and deployment evidence are recorded in the external delivery output. Demo/test validation remains explicitly separate from actual merchant readiness.
