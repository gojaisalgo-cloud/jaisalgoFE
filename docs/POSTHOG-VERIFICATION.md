# PostHog implementation verification — 4 November 2026

## Checks performed

- `npm test`: **74 passed, 0 failed**. Includes eight new PostHog tests covering safe URLs/attribution, blocked-storage identity, route race/deduplication, typed PII rejection, replay/heatmap redaction, trusted financial payloads, real isolated demo settlement, duplicate settlement, delivery outage/retry, refunds and consent withdrawal.
- `npm run typecheck`: passed.
- `npm run build`: production build passed, existing public and private route structure retained.
- `npm run test:admin`: isolated HTTP integration passed. Covers admin authentication/CSRF, catalogue edits, stale edits, departures, payment idempotency, early-balance blocking, approved offline receipts, cancellation/refunds, analytics authorization/PII protection, financial deduplication and consent withdrawal.
- `npm run lint`: 13 existing errors and 9 existing warnings. New PostHog modules/tests have no lint diagnostics. The repository-wide check remains unsuccessful; no claim of a clean baseline.
- `npm audit --omit=dev`: 0 known production dependency vulnerabilities at verification time. This is a registry audit, not a comprehensive security guarantee.
- `git diff --check`: passed.
- Existing HTTP SEO audit on the production preview: **73 indexable pages, 73 sitemap entries, 135 internal targets, 18 image assets, 0 critical issues**. Canonicals/JSON-LD/private noindex remain intact. No Google indexing or field Core Web Vitals claim.

## Actual browser regression

Used the in-app browser against a completed production build on an isolated temporary database in **demo mode**, never the user's local booking database or live payments.

At **390 × 844**:

1. Home consent choice → Quick Jaisalmer Escape details.
2. Opened itinerary and price tabs → Choose date.
3. Changed date to 4 January 2027 and group from two to three travellers. Full estimate changed from ₹9,705 to ₹15,276; ₹99 remained part of the total.
4. Entered fictional QA name/mobile, accepted the sandbox terms, submitted the demo booking.
5. Instant ticket showed the same date/group, ₹99 simulated token payment and ₹15,177 balance.
6. Download Ticket produced a PNG download and the success state.
7. My Bookings recovered the saved demo ticket without login or email.

The ticket's document width matched 390px and 1365px desktop viewports, with no horizontal overflow. No email field was present; private-ticket exclusion markup was present. No browser warning/error logs were observed during this run. Temporary viewport override was reset and QA tab closed afterward.

Screenshot: `../jaisalgo-posthog-mobile-ticket.png` in the external delivery outputs folder shows the sample ticket, download/share controls and actual download success feedback. It contains disposable demo data only. These checks verify booking/UI regression with vendor tracking unconfigured; they do **not** demonstrate PostHog receiving events.

## Activation and remaining external requirements

No real `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` or `NEXT_PUBLIC_POSTHOG_HOST` was present. No PostHog management credentials or accessible signed-in project tab were available. Consequently live ingestion, recording inspection, dashboard creation, remote deletion and documented SQL execution remain unverified. The exact dashboard recipe and activation checklist are in [POSTHOG_ANALYTICS.md](POSTHOG_ANALYTICS.md).

Production financial analytics additionally depends on the existing hosted persistent database, verified payment setup and supplier launch gates. The integration preserves those gates. No live money was charged, historical conversion invented, geo-IP location collected, Google impression fabricated or customer email requested.

Commit/push/deployment evidence is recorded separately in the delivery output after publication; this file describes the implementation checks and their limits.
