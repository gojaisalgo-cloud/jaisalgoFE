# PostHog analytics — 4 November 2026

Implemented in the existing Next.js 16 App Router application. The original first-party analytics, public routes, SEO, package pricing, inventory, Razorpay verification, refunds and ticket access remain in place. PostHog is an optional consented sidecar, not a source of booking truth.

## Installation and activation

`posthog-js` 1.445.1 and `posthog-node` 5.61.2 are locked in `package-lock.json`. Initialization follows the official [Next.js setup](https://posthog.com/docs/libraries/next-js); backend delivery uses the [Node SDK](https://posthog.com/docs/libraries/node). The wizard was unnecessary because the application already has consent and financial analytics.

1. In the intended PostHog project, copy the **public project token** and ingestion host from project settings. Use a separate project for development/QA where possible.
2. Add the following to `.env.local`, and to the correct Vercel environment. Never commit a real `.env` or use a personal API key as the project token.

```dotenv
ANALYTICS_ENABLED=true
NEXT_PUBLIC_POSTHOG_ENABLED=true
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=YOUR_PUBLIC_PROJECT_TOKEN
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_POSTHOG_ENVIRONMENT=production
NEXT_PUBLIC_POSTHOG_REPLAY_SAMPLE_RATE=0.1
NEXT_PUBLIC_POSTHOG_ALLOWED_CAMPAIGNS=winter_2026
NEXT_PUBLIC_POSTHOG_ALLOWED_CONTENT=family_card,couple_card
NEXT_PUBLIC_POSTHOG_ALLOWED_TERMS=desert_package
```

The host must be exactly `https://us.i.posthog.com` or `https://eu.i.posthog.com`, matching the project. Self-hosted/custom hosts require an explicit code review before allowing them. The example campaign IDs are illustrative; register actual nonpersonal marketing IDs. Unknown campaign/content/term values become `other`, including on the backend. Source/medium are finite categories. Free-text search terms are not collected.

3. Use `development`, `preview`, and `production` respectively. If unset, Vercel's environment is used; local defaults to `development`. Public variables are embedded at build time: restart locally or redeploy after changing them. `ANALYTICS_ENABLED=false` also compiles browser tracking off; the server checks it at runtime. `NEXT_PUBLIC_POSTHOG_ENABLED=false` disables only this vendor integration.
4. Keep `BOOKING_MODE=demo` until all existing launch requirements are met. PostHog cannot enable payments or bypass missing persistent storage. Backend events require the same durable libSQL database as bookings; see [deployment setup](VERCEL-DEPLOYMENT.md). Public browser analytics can operate without that database once PostHog is configured.
5. Check the consent banner, accept only in a QA browser, and verify actual events in the intended project before calling tracking live.

**Handoff status:** No real project token/host was available in this checkout. No PostHog dashboard or project ingestion has been verified. Unconfigured installations load no SDK and send no vendor events. The implementation is not a claim that production analytics is active.

## Architecture and data boundaries

| Files | Responsibility |
| --- | --- |
| `instrumentation-client.ts`, `lib/analytics/posthog-client.ts` | One lazy browser singleton after consent; manual router pageviews/leaves; privacy hooks |
| `posthog-navigation.ts` | Reject duplicate route effects and stale SDK-ready callbacks; one landing signal per observed session/tab |
| `posthog-schema.ts`, `posthog-privacy.ts` | Strict event properties, finite marketing data, public-path normalization, replay/heatmap URL scrubbing |
| `data/analytics-public-paths.json` | Approved public routes; update alongside newly published public routes, never from arbitrary query strings |
| `components/analytics-provider.tsx`, `lib/analytics/client.ts` | Existing consent and first-party bridge; actual DOM visibility/actions |
| Package information, reservation form, payment panel, gallery and digital ticket components | Actual feature interactions; no form serialization |
| `lib/analytics/server.ts`, `posthog-server.ts`, `posthog-after.ts` | Verified ledger milestones, stable delivery identifiers, durable outbox, delivery after HTTP response |
| `scripts/posthog-retry.mjs`, `tests/posthog.test.ts` | Operator retry and isolated privacy/financial/navigation regression checks |

Browser identity is a random UUID, not a customer identifier. Consent is checked before identity creation, SDK import, queueing and sending. Blocked storage uses a stable in-memory fallback for the current document. PostHog's session UUID is carried to the backend when initialized. If the SDK has not loaded yet, the bootstrapped distinct ID still links events, but the session ID can be unavailable. No customer login exists, so there is no invented `identify()` or cross-device merge. Existing admin sign-out resets the optional identity.

First touch persists across consented visits; latest touch is captured once on document entry, then preserved during internal client navigation. Internal links never overwrite it. This is entry attribution, not a claim of perfect multi-tab/session stitching. Marketing attribution is client supplied and is not fraud-proof financial data.

Every custom browser event receives safe current path/type, environment, viewport category, allowed attribution, `traffic_source`, and first/latest prefixed attribution properties. Browser/OS metadata remains available. Query strings and fragments are removed. Private routes are normalized to `/book/[slug]`, `/reservations/[id]`, `/my-bookings`, and `/admin`; unknown paths become `/not-found`. No booking IDs, access tokens, customer names, mobile numbers, addresses, payment references or raw order records are transmitted.

## Event dictionary

Properties appear only where genuinely available. Money is **INR**, converted from the application's integer paise. Common business fields include `package_slug`, `package_id` (the existing public slug), `package_category`, `arrival_city`, `travel_month`, `traveller_count`, `children_count`, `package_price_inr`, `reservation_amount_inr`, `payment_amount_inr`, `payment_phase`, `payment_environment`, `cta_location`, `booking_step`, `attempt_id`, `section`, `position`, `reason`, `city_guide_target`, and `scroll_depth`.

| Event | Actual trigger / interpretation |
| --- | --- |
| `$pageview`, `$pageleave` | Consented route visit / departure; React effect replays and stale asynchronous callbacks are deduplicated. Pagehide leaves are best effort. |
| `landing_page_viewed` | First observed page of the SDK session in this tab; same-session refresh does not create another landing signal when session storage works. |
| `destination_explored` | Existing place or experience detail route opened. |
| `package_list_viewed` | Packages directory route opened. |
| `package_card_viewed` | At least half of an existing package card enters the viewport, once per route visit. It is not a detail view. |
| `package_viewed` | Package details route or existing (i) information panel opened, once per package per route visit. |
| `destination_gallery_interacted` | Existing homepage destination gallery arrow, tab, swipe or keyboard changes the scene. |
| `package_itinerary_viewed` | Existing information panel's itinerary tab becomes active. |
| `package_inclusions_viewed` | Existing information panel's overview tab becomes active. |
| `package_price_viewed` | Existing price tab becomes active. |
| `travel_date_selected`, `traveller_count_updated`, `package_variant_updated` | Actual checkout option changes, not initial rendering/defaults. |
| `reserve_cta_clicked` | Existing Book link or submit action; `cta_location` distinguishes card/detail/checkout. It is not payment success. |
| `booking_started`, `checkout_started` | Real checkout form is present. Unavailable hosted checkout does not emit a false start. These coincide in the current single-page checkout. |
| `traveller_details_started` | Name/mobile field receives focus. No value is read or captured. |
| `traveller_details_completed` | Validated draft creation succeeds, once per idempotent draft. |
| `payment_initiated` | Existing payment action is invoked; actual mode, token/balance phase, amount and contract total are separate. Still not success. |
| `payment_attempt_failed` | Client gateway failure callback. Diagnostic only; may differ from later server reconciliation. |
| `booking_validation_failed`, `booking_error` | Existing native validation / API error / connection, availability, changed-price or gateway diagnostic. Finite reason codes only; no raw error text. |
| `ticket_viewed`, `ticket_downloaded` | Existing private ticket rendered / PNG generated and browser download invoked. Does not prove the user saved or opened the file. |
| `whatsapp_contact_clicked`, `call_contact_clicked` | Existing WhatsApp/tel link clicked. Does not imply a support conversation occurred. |
| `reservation_offer_viewed` | Existing ₹99 hero/card/details offer becomes visible. |
| `hero_cta_clicked`, `trust_section_viewed` | Existing hero link clicked / trust strip becomes visible. No fabricated review exposure. |
| `faq_expanded` | Public native details accordion opened. Includes general informational accordions; private checkout accordions are excluded. |
| `scroll_depth_reached` | Public page passes 25/50/75/100%, once per threshold/route visit. |
| `city_guide_viewed`, `city_package_clicked` | Actual published city guide opened / linked package CTA clicked; target city is content intent, not visitor residence. |
| `$autocapture`, `$$heatmap` | Consented public link/button clicks and safe coordinate buffers only. Element text, attributes, hrefs, form and input collection are removed. |

`package_gallery_interacted` is reserved in the typed dictionary but is **not emitted**: the current package photo layout has no interactive gallery. The real homepage gallery uses the separate destination event above. No feature was invented to generate an event. `package_name` is not transmitted because the stable public slug is sufficient; use catalogue labels in reporting. There is no departure-city selector or active experiment, so neither departure city nor a fictional variant is generated.

### Backend-only outcomes

| Event | Trusted condition |
| --- | --- |
| `reservation_completed` | A stored booking and verified captured **9900-paise token ledger payment** exist. `deposit_collected_inr=99`. |
| `booking_confirmed` | Same committed reservation record; does not mean fully paid or all supplier details confirmed. |
| `full_booking_paid` | Both verified ledger receipts and stored booking paid amount reach the contract total. `fully_paid=true`. |
| `payment_failed` | Backend draft has failed payment state. `payment_phase` distinguishes token/balance. No deposited money is attached. |
| `refund_recorded` | Actual refund ledger total increases; `refund_total_inr` is a cumulative snapshot, not an incremental amount to sum. |
| `trip_completed` | Existing authenticated operator explicitly marked an active, fully paid, unrefunded trip completed. A passing travel date is insufficient. |

All financial events carry `event_source=verified_backend`, real `payment_environment`, safe package/travel properties, original timestamp, consented anonymous identity, and available first/latest attribution. The client schema cannot emit any financial-success names. No order ID, booking record, provider signature or customer details enter these payloads.

## Delivery and deduplication

Financial milestone IDs come from existing ledger keys. The stored event supplies the original timestamp/properties, including after retries. Each vendor UUID is deterministically derived from that ID. An outbox row uses the same primary key; repeated signed webhooks, status checks or settlements cannot insert another row for that milestone. Node `captureImmediate()` is awaited in Next.js `after()`, outside the response/payment path. No vendor network request runs inside financial transactions.

Delivery claims at most ten rows with a lease, retries failures after a minute, and stops after ten failed attempts. A crash can leave an uncertain send; retries reuse UUID, event name, distinct ID and timestamp for PostHog's [event deduplication](https://posthog.com/docs/data/events). This is at-least-once delivery with provider deduplication, not an immediate exactly-once network guarantee. `sent` means ingestion HTTP acknowledgement, not proof that an insight includes the event.

Subsequent booking/analytics/admin write traffic drains due rows. There is no scheduled retry service configured. Operators can run `npm run analytics:retry` with the production database and correct environment loaded through a secure environment, never by copying tokens into commands. Inspect only aggregate outbox status:

```sql
SELECT state, attempts, COUNT(*) AS rows FROM posthog_outbox GROUP BY state, attempts;
```

After resolving an outage, an authorized operator may explicitly reset exhausted pending rows' `attempts`/`next_at` in the database, then retry. Preserve payload, ID and timestamp; never reconstruct a success from a click. Monitor pending/exhausted counts and reconcile acknowledged events with PostHog Live events before relying on financial dashboards. Existing booking/refund ledger reports remain authoritative even if analytics fails. Events made before configuration are not automatically backfilled as historical conversions.

## Funnels and financial formulas

Use `analytics_environment=production` globally. Apply `payment_environment=live` and `event_source=verified_backend` **to financial steps/series**, not globally: public pageviews do not have a payment environment. Keep demo/test in separate insights. Standard conversion window: 7 days, ordered steps, unique anonymous visitors; show completed windows for trend comparisons.

- Primary journey: `landing_page_viewed → package_viewed → reserve_cta_clicked → checkout_started → payment_initiated [payment_phase=token] → reservation_completed`. This diagnostic path excludes direct checkout users and users who never open details; it is not the denominator for all sales.
- Package conversion: `package_viewed → reservation_completed`, hold `package_slug` constant. This is the matched per-package conversion rate and time-to-reserve population.
- Checkout: `checkout_started → payment_initiated [token] → reservation_completed`.
- Optional engagement: separate `package_viewed → package_itinerary_viewed → reserve_cta_clicked` and inclusions/price equivalents. Do not require these in the primary journey.
- Offer: `reservation_offer_viewed → reserve_cta_clicked → checkout_started`.
- Fulfilment: `reservation_completed → full_booking_paid`; use an appropriately longer window such as 90 days and explain recent cohorts not yet due.

Matched conversion = visitors completing the last step within the window / eligible visitors at the first step. Step drop-off = 1 minus next-step matched reach / current-step reach. Do not divide unrelated total event counts or call all unresolved initiations failures. Use unique `attempt_id` for retry diagnostics where present, not as a global hold property on landing pages that have no attempt.

Verified gross deposit receipts = **sum `deposit_collected_inr` on `reservation_completed` only** (₹99 per unique verified reservation). Package contract value is `package_price_inr`, not money received. `total_collected_inr` and `outstanding_balance_inr` are state snapshots: never sum them across reservation, confirmation and full-payment events. Outstanding = max(contract total − verified receipts, 0). Refund snapshots need latest-per-booking accounting in the private ledger; the vendor intentionally has no booking IDs. Do not subtract cumulative refund snapshots as if they were transaction deltas. Accounting revenue and net-refund reconciliation remain first-party ledger metrics.

Average elapsed time to reserve = mean of matched reservation timestamp − preceding same-package detail-view timestamp, in seconds. It includes inactive time; the original admin report's active mobile time is a different metric. Filter to completed, same-browser pairs within the window, never count unmatched visitors as zero. Funnel Time to convert supplies the corresponding distribution; confirm its selected statistic before labeling it a mean.

## Dashboard setup (documented, not created)

No PostHog management API/MCP credentials were available. Create **JAISLAGO — Growth & Booking Analytics** using Dashboards → New dashboard → Blank dashboard. Use the same production filter, last 30 days, daily interval, Asia/Kolkata timezone. Build each insight in Product analytics → New insight, set the specified type/events, then save/add to this dashboard. Current official guides: [dashboards](https://posthog.com/docs/product-analytics/dashboards), [trends](https://posthog.com/docs/product-analytics/trends), [funnels](https://posthog.com/docs/product-analytics/funnels), [paths](https://posthog.com/docs/product-analytics/paths).

| Tile | Exact insight definition |
| --- | --- |
| A. Visitors & sessions | Trends: `$pageview`, Unique users; second series `$pageview`, unique values of `$session_id`. Daily. Label as consented observed browsers/sessions, not all traffic. |
| B. Traffic sources | Trends: `landing_page_viewed`, Unique users, breakdown `latest_touch_traffic_source`; search/direct/paid/social/email/referral remain distinct. |
| C. Landing pages | Trends table: `landing_page_viewed`, Unique users, breakdown `page_path`. |
| D. Packages explored | Trends table: `package_viewed`, Unique users, breakdown `package_slug`; optional second card-impression insight uses `package_card_viewed`. |
| E. Package conversion | Two-step package funnel above; hold `package_slug` constant, breakdown that property, 7 days. |
| F. Full booking funnel | Six-step primary journey above, conversion steps with per-step drop-offs; exclude optional itinerary/gallery steps. |
| G. ₹99 offer CTR | Offer funnel above, 7 days; separate visibility, CTA and checkout reach. Filter CTA to desired `cta_location` when assessing a placement. |
| H. Payment health | Trends: `payment_initiated` with phase token; `reservation_completed`; `payment_failed` with phase token. Apply live/backend filters only where relevant. Include `payment_attempt_failed` as a separately labeled browser diagnostic, not another server failure. |
| I. Verified ₹99 receipts | Trends: `reservation_completed`, Sum of `deposit_collected_inr`, INR, live/backend filters. Separate secondary tile for `full_booking_paid` count. |
| J. City-target content conversion | Package conversion funnel, breakdown `first_touch_landing_page_path`, filter values starting `/jaisalmer-travel-from/`. Label **city guide target**, never departure city/residence. Actual departure-city conversion is unavailable until an explicit selection exists. |
| K. Mobile/desktop conversion | Duplicate package funnel, breakdown `device_category`, attribution from the first step. Financial backend may not carry viewport; do not require all-step breakdown matching. |
| L. Campaign conversion | Duplicate package funnel, breakdown `first_touch_utm_campaign` or `latest_touch_utm_campaign`; specify which model in the title. Unknown values aggregate as `other`. |
| M. Paths before abandonment | Checkout funnel → select the payment/reservation drop-off → Show user paths → before drop off. Use pageviews and business events, exclude heatmap/autocapture noise. Wait for the 7-day window to mature; this is observed nonconversion, not a verified cancellation. |
| N. Time to reserve | Duplicate E, Graph type → Time to convert. Save the distribution; show mean only after validating the selected mean statistic/matched pair population, with units and count. |
| O. Returning-browser conversion | Create a cohort with `landing_page_viewed` before the start of the reporting period; duplicate E with that cohort. Compare to its complement, retaining only observed entrants. This is a reproducible fixed-period returning-browser proxy; clone/update cohort dates for the next period. It does not identify new/returning customers across devices. |

For an exact mean independent of the funnel display's statistic, save a SQL insight based on completed same-package pairs. This example uses the earliest observed package view and first later live reservation within seven days in the selected 30-day dataset. Its unit is seconds, one observation per anonymous browser/package; the edge-day dataset is incomplete, so use matured date ranges for comparisons:

```sql
WITH views AS (
  SELECT distinct_id, properties.package_slug AS package,
         min(timestamp) AS viewed
  FROM events
  WHERE event = 'package_viewed'
    AND properties.analytics_environment = 'production'
    AND timestamp >= now() - INTERVAL 30 DAY
  GROUP BY distinct_id, package
), pairs AS (
  SELECT v.distinct_id, v.package, v.viewed, min(e.timestamp) AS reserved
  FROM views v JOIN events e ON e.distinct_id = v.distinct_id
    AND e.properties.package_slug = v.package
  WHERE e.event = 'reservation_completed'
    AND e.properties.analytics_environment = 'production'
    AND e.properties.payment_environment = 'live'
    AND e.properties.event_source = 'verified_backend'
    AND e.timestamp >= v.viewed
    AND e.timestamp <= v.viewed + INTERVAL 7 DAY
  GROUP BY v.distinct_id, v.package, v.viewed
)
SELECT count() AS matched_pairs,
       avg(dateDiff('second', viewed, reserved)) AS mean_seconds
FROM pairs
```

This SQL recipe is documented but has not been executed against the user's PostHog project. Confirm the project's SQL editor accepts it and reconcile a sample of matched times before presenting it as a validated business KPI.

### SEO reporting

Use the city-target filter from J on landing/page/package/CTA/checkout funnels and deposit receipts broken down by `first_touch_landing_page_path`. Filter `first_touch_traffic_source=search` for organic acquisition and label last-touch reports separately. These are on-site observations, **not Google search impressions, rankings or actual home/departure locations**. Search Console is not connected; its search impressions/clicks stay separate. No geo-IP collection is enabled. The 15 requested city markets cannot be reported as actual visitor geography without a separate authorized coarse source.

## Replay, heatmaps and consent

- No SDK import or collection before opt-in; decline, DNT and GPC suppress it. Existing footer Privacy preferences reopens the choice. Booking is independent of the choice.
- All input values, text and element attributes are masked. Forms/inputs/iframes/private marked elements are blocked. Public replay defaults to 10% of eligible sessions; set sampling to `0` to stop it. Private checkout, ticket, saved-booking and admin screens have replay, heatmaps and autocapture disabled. Navigation start stops capture before entering them; snapshots are additionally dropped on private routes.
- No console, request headers, request/response bodies, canvas, cross-origin iframe capture, performance capture, exceptions or survey collection. Network replay entries are dropped. Payment iframes are excluded. Snapshot metadata and heatmap URL keys are scrubbed; only safe public coordinates survive.
- Strict masking reduces replay fidelity, element labels and heatmap selectors. This is deliberate; useful layout/scroll/click information may remain, but validate the actual recording before relying on it. It is not a claim that a replay was observed.
- Geo-IP enrichment is disabled on browser and server events. HTTP transport necessarily reaches the ingestion provider; this is not a claim of network-level anonymity. SDK IP-geolocation settings do not replace the provider's processing/retention contract.
- Withdrawal resets browser identity, stops capture and asks the existing server endpoint to remove current-session optional context and pending outbox rows. Delivery already in flight can race withdrawal. Previously ingested PostHog events, other older sessions and cached remote data need the provider's authorized deletion process; a browser opt-out cannot promise retroactive deletion. First-party analytics retention remains 180 days. Configure PostHog retention/deletion/access policy separately; there is no automatic mirrored remote purge.
- No CSP currently blocks the SDK. Allow the selected ingestion origin and its official asset origin (`us-assets.i.posthog.com` or `eu-assets.i.posthog.com`) if a future CSP/firewall is introduced; inspect actual requests then. Ad blockers/poor connectivity can suppress measurements. SDK delivery failure is isolated from booking.

## Verification and production checklist

Automated isolated tests cover safe URL/marketing payloads, stable anonymous identity and blocked storage, route races/deduplication, typed PII rejection, replay/heatmap scrubbing, backend-only financial events, actual demo settlement, repeated settlement, failed delivery/retry with the same identity/timestamp, refund snapshots and withdrawal. Fake test tokens never send external events; delivery tests use an injected in-memory sender. Test mode is not live money.

Before activation, in an authorized test project:

1. Rebuild with the actual public token/host and distinct environment. Open browser network tools: before consent and after Decline, verify there are no PostHog ingestion/replay requests. Repeat with DNT/GPC.
2. Accept consent. In PostHog Activity/Live events, inspect one `$pageview` per route visit and one landing per session/tab. Refresh, change routes quickly, navigate back and check SPA duplicate suppression.
3. Follow home → package card/details → optional tabs → Reserve → date/travellers → valid name/mobile → payment. Verify event order and retained first/latest attribution using approved UTM test IDs; inspect JSON properties for excluded personal values and tokenized URLs. Do not paste private ticket links into analytics filters.
4. Use a demo/test checkout with durable test storage and actual provider test verification where applicable. Observe backend `reservation_completed` once, matching anonymous identity, ₹99 deposit, full contract value and balance separately. Repeat status/webhook/verification and confirm the same UUID/original timestamp, with no duplicate conversion after ingestion deduplication.
5. Test validation, offline retry, unavailable date, changed price, pending/failed payment and gateway dismissal. None may create success without a verified captured ledger receipt. PostHog outage must leave a valid booking/ticket intact. Check pending delivery counts and retry after connectivity returns.
6. View/download ticket; confirm only sanitized custom events and no replay, form values, QR/access URL, names or mobile numbers. Check My Bookings and admin likewise. Confirm public sampled replay has masked text/attributes and no network/console/payment iframe content.
7. Repeat on a phone viewport and desktop. Confirm optional tracking does not alter options, price, focus, loading states, navigation or ticket controls. Re-run tests, typecheck, production build, admin integration and SEO audit.
8. Create the dashboard above and reconcile vendor receipts against consent-covered private ledger records. Record actual observed project/event IDs in a private operations log, not public source. Configure retention/access, monitor outbox failures and secure hosted storage before live checkout.

## Known limitations

Missing public project configuration prevents live ingestion verification. Dashboard creation, actual replay inspection, PostHog SQL execution, management/deletion API and Search Console integration were not performed. Production hosted storage and payment/supplier launch prerequisites are separate existing blockers. No active experiment, customer login identity, actual departure selector, true residence geography, interactive package gallery or cross-device customer history was invented. Consent/ad blockers/private-screen exclusions intentionally reduce coverage. Rates describe observed anonymous browsers and must disclose that coverage.
