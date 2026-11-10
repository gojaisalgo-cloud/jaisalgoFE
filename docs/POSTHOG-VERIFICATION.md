# PostHog verification — 10–11 November 2026

This supersedes the older activation notes. Project 332646 is configured and actual ingestion has been checked; configuration alone is not used as evidence of delivery.

## Automated checks

- Full regression suite: **125 tests passed, 0 failures**. Includes real isolated demo settlement, stable ledger UUIDs, retry/outage/withdrawal handling; strict search/URL/PII allowlists; renewed purpose-specific consent and DNT/GPC; masked identification payloads; active versus idle/background timing; stable pseudonymous account identity; auth/enquiry outbox deduplication and cancelled booking adapters.
- TypeScript check: passed.
- Configured Next.js production build: passed.
- Targeted lint on analytics utilities, instrumented components and API routes: passed. The existing central consent effect was adjusted to initialize its storage-backed UI after the first frame, and its privacy link uses Next Link. This is not a claim that unrelated repository-wide lint findings have been fixed.
- No new package/dependency added. `git diff --check` passed.

## Actual browser and ingestion checks

Used the existing EU project with an isolated local production build, disposable file DB, `BOOKING_MODE=demo`, signup alerts disabled and `analytics_environment=development`. No real payment, Google sign-in or operational WhatsApp test was performed. The production dashboards explicitly exclude this development traffic.

1. Guest browsing and renewed consent worked. Replay and location checkboxes initially unchecked; both explicit choices were exercised, then consent withdrawn through Privacy preferences.
2. Entered camel in homepage search and reached two matching packages. Opened a package and entered checkout; later exercised catalog search and sorting.
3. Submitted a disposable demo booking and reached “Your ticket is ready”, clearly labelled demo with ₹99 simulated and the correct remaining package balance. Payment logic remained unchanged.
4. Created a local trip brief; UI explicitly said no enquiry was sent. A real external enquiry provider is not configured, so server acceptance was covered with the isolated outbox regression rather than fabricated delivery.
5. Inspected actual PostHog event records: `search_submitted`, `search_results_viewed`, `session_started`, `page_engagement`, `ticket_viewed`, `booking_confirmed`, `reservation_completed`. Backend financial events were labelled `verified_backend`, `development`, `demo`; success was not derived from a click.
6. Inspected QA rows had no name/email/phone fields. Search was reduced to camel/finite intent; checkout and ticket paths were `/book/[slug]` and `/reservations/[id]` without access keys or record IDs.
7. A sampled QA recording was ingested with zero console logs/errors and 30-day retention. Opened the actual recording and observed masked public-page text/attributes. Private checkout/ticket content is excluded by route, transition and transmission guards; form blocks remain enforced. This was a sample inspection, not an exhaustive audit of every recording.
8. After the new ingestion transformation, inspected new QA rows retained a coarse country while latitude, longitude and postal code were null. Earlier project data is not retroactively changed by the transformation.
9. Tested the privacy notice and consent panel at **390×844** and normal **1280×720** desktop size. No horizontal overflow; choices and action buttons fit on mobile. Temporary viewport override reset and QA tabs closed. No browser warnings/errors appeared in the exercised checkout/search flow.

## PostHog project configuration

Created and saved two dashboards containing **19 native insights**; executed all 19 queries without errors or warnings. These are operational chart definitions, not approved semantic-catalog metrics. The existing starter dashboard was preserved. Project timezone remains UTC.

- Acquisition & engagement: https://eu.posthog.com/project/332646/dashboard/1102625
- Journeys & conversions: https://eu.posthog.com/project/332646/dashboard/1102627

Saved query definitions and IDs: `POSTHOG-DASHBOARDS.json`. Every chart uses `analytics_environment=production`; finance additionally uses live payment mode on the relevant series/step. New signup, delivery, cancellation and conversion panels may correctly show zero/empty until genuine consenting activity occurs.

Kept IP anonymization enabled; disabled project console/performance/automatic-exception capture; set recording sample rate 10% and retention 30 days. Added the standard property-filter transformation after GeoIP to null unwanted location/contact/profile fields. All these protections also have SDK allowlists/masking where applicable.

## Limits and operations

Real Google account sign-in was previously declined by the user and was not performed. Authentication verification, opaque IDs and lifecycle deduplication are covered by isolated regressions; the first genuine consenting Google signup remains the live identity-merging smoke test. No live charge/refund/cancellation was created to populate a chart. Delivered enquiry success requires the existing endpoint to be configured and actually accept a request.

Consent/blockers/sampling/private-page exclusions mean this is not a census of every visitor. PostHog product-event retention, processor/legal review and access/deletion handling remain operator responsibilities. Withdrawal stops future capture and suppresses current-session pending deliveries; already-ingested vendor data needs a separate deletion process. No demographic collection/inference, paid export, recurring report email or new outbound marketing was configured.

See `POSTHOG_ANALYTICS.md` for event definitions, identity/consent behavior, funnel windows and outbox recovery. GitHub/Vercel publication evidence is recorded in the external delivery summary after deployment.
