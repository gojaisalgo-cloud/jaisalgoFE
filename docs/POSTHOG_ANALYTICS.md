# JaisalGo product analytics

Updated 10–11 November 2026. Existing packages, ₹99 reservation logic, Razorpay verification, operational WhatsApp alerts, routes and booking access remain unchanged. PostHog is an optional analytics sidecar; the booking ledger remains authoritative.

## Audit and architecture

The audit found a working consented anonymous SDK, private-route redaction and financial outbox, but gaps in search, account identity, enquiries, cancellations, engagement and saved dashboards. These were extended centrally without new dependencies.

| Touchpoint | Implementation |
| --- | --- |
| Entry, SPA navigation, exit, scrolling, support links | `components/analytics-provider.tsx`; `instrumentation-client.ts` |
| Homepage search, destinations, collections, package discovery | `travel-search.tsx`, `booking/catalog.tsx`, `jaisalmer-discovery.tsx` |
| Details, galleries, options, price and inclusions | Existing package information/gallery/booking components and tracking bridge |
| Optional Google account popup and logout | `customer-entry.tsx`; verified auth/session routes |
| Custom planner and delivered enquiries | `enquiry-form.tsx`; enquiry route |
| Checkout, payment, tickets, refunds and cancellations | Existing reservation/payment/ticket components; verified backend ledger |
| Consent, identity, privacy and naming | `lib/analytics/consent.ts`, `client.ts`, `posthog-client.ts`, `posthog-schema.ts`, `posthog-privacy.ts` |
| Auth/enquiry outcomes and reliable delivery | `customer.ts`, `posthog-server.ts`, `posthog-after.ts` and existing outbox |

`posthog-js` is imported lazily after consent; one singleton serves all components. `captureBehaviour` validates a strict property allowlist. `captureBehaviourOnce` deduplicates exposures within a route visit. Router revision checks suppress stale initialization callbacks and duplicate React effects. Financial/auth/enquiry success names cannot be emitted through the browser utility. Raw errors, form serialization and raw search strings are forbidden.

## Configuration

Production project: **332646**, EU ingestion `https://eu.i.posthog.com`. The existing public project token stays in environment configuration, never this document. No personal API key belongs in a public variable.

```dotenv
ANALYTICS_ENABLED=true
NEXT_PUBLIC_POSTHOG_ENABLED=true
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=YOUR_PUBLIC_PROJECT_TOKEN
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
NEXT_PUBLIC_POSTHOG_ENVIRONMENT=production
NEXT_PUBLIC_POSTHOG_REPLAY_SAMPLE_RATE=0.1
```

Use `development` locally and `preview` on staging. Public variables are embedded at build time; redeploy after changing them. `ANALYTICS_ENABLED=false` disables first-party measurement and compiles both optional vendors off; `NEXT_PUBLIC_POSTHOG_ENABLED=false` disables PostHog alone. Register only nonpersonal campaign/content/term identifiers in the existing `NEXT_PUBLIC_POSTHOG_ALLOWED_*` allowlists. Unknown values become `other`; source and medium use finite categories. No new dependencies or credentials were introduced.

## Consent, privacy and identity

Version **2026-11-10-v2** requires a fresh analytics choice. An old Allow does not silently enable expanded purposes; an old Decline remains declined. Optional recordings and approximate location are separate, unchecked choices. Browsing, Google sign-in and bookings work with analytics declined. Do Not Track and Global Privacy Control override all choices. The same central choice gates the existing public-page GA4 adapter.

Before consent there is no PostHog identity, SDK loading or event queue. Anonymous users receive a random UUID (memory fallback if storage is blocked). After the server verifies Google sign-in, `analyticsId = acct_ + SHA256(namespace + internal random customer ID)` identifies the account. It is independent of Google subject, name and email. `identify()` joins the consenting anonymous journey to that account; returning sessions reuse the server-derived account ID. Only `account_type`, `sign_in_method` and consent version update the person profile. Session lookup occurs before SDK initialization. Logout or a changed/expired account rotates the anonymous ID and clears pending browser analytics/timing state to avoid shared-device attribution.

Names, email, phone, Google credential/subject, passwords, OTPs, addresses, payment credentials, private booking IDs/access keys, raw errors and raw search/referrer URLs are excluded. Queries/fragments are stripped; unknown routes become `/not-found`; private routes become `/book/[slug]`, `/reservations/[id]`, `/verify/[token]`, `/my-bookings` or `/admin`. Admin behavior is excluded entirely. Published city-guide targets describe content interest, not where a visitor lives.

Browser/OS/version, device type, viewport category and screen/viewport dimensions are available when the SDK supplies them. No fingerprint is constructed. Only a separate location opt-in permits request-IP enrichment for approximate city, region/state and country. Server events disable GeoIP so the hosting server is not mistaken for the visitor. Project IP anonymization remains enabled. A project ingestion transformation (`01a1c6b0-3d51-0000-d5e5-353c2b5cfdec`, after GeoIP, order 2) nulls derived coordinates, postal code, accuracy radius, time zone and direct contact/profile fields. It affects new ingestion; it does not retroactively remove historical fields. No GPS is requested. Location can be inaccurate, absent or affected by VPNs.

**Demographics are not collected.** There is no voluntary demographic input in the current product. Gender is never inferred from names, behavior or devices. Adding any demographic collection requires an actual user-provided field, clear purpose and corresponding consent/schema review.

Withdrawal immediately blocks future capture, stops replay, resets browser identifiers, clears queued events, and suppresses pending first-party/outbox deliveries for the current session. Already transmitted events cannot be recalled by a browser toggle; vendor deletion requests require operator handling. First-party anonymous event retention is 180 days; replay retention is 30 days. PostHog product-event retention follows the project's plan/configuration and must be reviewed operationally. Account, payment and booking records have separate operational obligations. The public privacy notice describes the choices and contact route. This implementation is not a legal certification: the operator remains responsible for notices, processor arrangements, access/deletion requests and retention under applicable Indian requirements. The [final DPDP Rules notification](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf) has phased commencement; do not treat every provision as already in force.

## Session replay

Replay requires both analytics and recording consent, then samples **10%**. It is restricted to public pages. All text, element attributes and inputs are masked; forms, account/privacy dialogs and iframes are blocked. Navigation toward checkout/private pages stops recording before the transition; route checks and the final transmission hook enforce the restriction again. Public click autocapture/heatmaps retain safe element categories and coordinates only. Console capture, network headers/bodies, canvas, automatic exceptions and performance payloads are disabled. Project defaults additionally disable console/performance/error capture. New recordings expire after 30 days. No recording should be treated as a complete journey: sampling, excluded pages, opt-out, blockers and network loss leave gaps.

## Event schema

Names use `snake_case`, except PostHog's `$pageview`, `$pageleave`, `$identify`, `$set`, `$autocapture`, `$$heatmap` and `$snapshot`. Typed code in `posthog-schema.ts` is the executable contract. Common fields include `analytics_environment`, normalized `page_path`, `page_type`, `device_category`, `account_type`, `visitor_type`, `visit_count`, allowed first/latest attribution and SDK/session metadata. Fields are emitted only when available.

| Events | Trigger and safe properties |
| --- | --- |
| `$pageview`, `$pageleave`, `landing_page_viewed` | Deduplicated route lifecycle; landing once per observed SDK session/tab |
| `session_started` | New observed SDK session; `visit_count`, `visitor_type` (new/returning browser) |
| `page_engagement` | Page exit/change; `active_seconds`, `elapsed_seconds`, normalized path; active excludes hidden tabs and inactivity beyond 60 seconds |
| `navigation_clicked` | Internal link; normalized `target_path`, `navigation_area` (header/footer/content); no anchor text |
| `scroll_depth_reached` | Public page crosses 25/50/75/100%, once per route visit |
| `search_submitted` | Actual search submission; finite `search_intent`, `has_query`, `has_date`, collection and traveler count; no raw text or exact dates |
| `search_results_viewed` | Stable catalog results after 400ms; safe search fields plus `result_count`; once per query per route visit |
| `package_filter_changed`, `package_sort_changed` | Actual choice; finite `filter_key` or `sort_order`, no arbitrary values |
| `collection_explored`, `experience_filter_changed` | Actual collection link/filter; approved `collection` and normalized target |
| `destination_explored`, `city_guide_viewed`, `city_package_clicked` | Existing destination/experience/city guide opened or linked package clicked |
| `destination_gallery_interacted`, `package_gallery_interacted` | Existing gallery action; finite position/section/CTA properties |
| `package_list_viewed`, `package_card_viewed`, `package_card_clicked`, `package_viewed` | Directory, half-visible card, detail link, or details/information panel; public `package_slug` |
| `package_itinerary_viewed`, `package_inclusions_viewed`, `package_price_viewed` | Existing information section/tab opened |
| `travel_date_selected`, `traveller_count_updated`, `package_variant_updated` | Actual booking options changed; month only, traveler count, stay category/rooming/travel mode |
| `reservation_offer_viewed`, `trust_section_viewed`, `hero_cta_clicked`, `reserve_cta_clicked` | Visible offer/trust content or actual CTA; location and ₹99 token amount; not paid outcomes |
| `booking_started`, `checkout_started` | Actual checkout form present; these coincide in the current single-page checkout |
| `traveller_details_started`, `traveller_details_completed` | Focus without reading personal values; validated draft creation succeeds |
| `payment_initiated`, `payment_attempt_failed` | Gateway action/client failure; actual `payment_environment`, phase and amount; never payment success |
| `booking_validation_failed`, `booking_error` | Validation/API/gateway diagnostic; finite reason codes only |
| `auth_prompt_viewed`, `auth_prompt_dismissed` | Optional account popup opened or explicitly closed/guest chosen |
| `login_started`, `login_failed`, `logout_completed` | Official Google button click, failed callback or successful logout; method google, finite failure reason |
| `enquiry_started`, `trip_brief_created`, `trip_brief_downloaded` | Planner focus, valid brief generation, download action; `enquiry_mode` local_brief/delivery; no entered values |
| `enquiry_submitted`, `enquiry_failed` | Delivery action/error when delivery is configured; submission is not acceptance |
| `ticket_viewed`, `ticket_downloaded` | Existing ticket rendered/download action; private path redacted; not proof a file was saved |
| `whatsapp_contact_clicked`, `call_contact_clicked`, `faq_expanded` | Existing support link/accordion; no guarantee a conversation occurred |

### Verified backend outcomes

| Event | Definition / deduplication |
| --- | --- |
| `signup_completed` | First verified account creation with current analytics consent; internal user-keyed stable event |
| `login_completed` | Successful verified Google session creation; hash of session token keys the event (token never transmitted) |
| `enquiry_accepted` | Configured external enquiry endpoint returned success; attempt UUID deduplicates analytics; local briefs never count |
| `reservation_completed` | Committed booking with verified captured 9900-paise token; `deposit_collected_inr=99` |
| `booking_confirmed` | Committed reservation; does not claim full payment or final supplier confirmation |
| `full_booking_paid` | Verified ledger receipts and booking paid amount reach the full contract total |
| `payment_failed` | Backend draft records failed payment; phase distinguishes token/balance/full |
| `cancellation_requested` | Existing booking reaches cancellation/refund-request or cancelled status, once per stable ledger milestone |
| `booking_cancelled` | Existing stored booking status is cancelled |
| `refund_recorded` | Refund ledger total increases; cumulative snapshot, not an increment to sum |
| `trip_completed` | Authenticated operator marked an eligible, fully paid, unrefunded trip complete |

Backend events have `event_source=verified_backend`, original timestamps, deterministic UUIDs, consented distinct ID and available SDK session ID. Finance carries `payment_environment` (demo/test/live), package, month, group size and INR values converted from integer paise. No provider order/payment references or customer records are exported. Browser success screens cannot create backend conversions.

## Delivery reliability

The durable libSQL outbox inserts by stable milestone ID and retries with the same UUID/name/distinct ID/timestamp. Repeated signed webhooks, settlement/status calls or auth/enquiry analytics retries do not create a second milestone. Delivery runs outside the response in Next.js `after()`; analytics failures never block payment, sign-in or enquiry delivery. At most ten rows are leased per pass, failures retry after one minute, maximum ten attempts. This is at-least-once transport with provider deduplication, not a claim of instantaneous exactly-once delivery. HTTP acknowledgement is not proof an insight has ingested the event.

Existing traffic drains due rows; no recurring retry service was created. Operators can run `npm run analytics:retry` in an authorized environment with the correct persistent DB. Inspect aggregate `state`, `attempts` and count in `posthog_outbox`; never dump payloads or tokens. Resolve an outage before resetting exhausted retry counters; preserve original identity, UUID and timestamp. Events before activation are not backfilled as invented conversions.

## Dashboards and analysis

Both dashboards were created, saved, laid out and their **19 native queries** executed successfully. The starter dashboard was preserved. Reproducible insight IDs/queries are in [POSTHOG-DASHBOARDS.json](POSTHOG-DASHBOARDS.json).

- [Acquisition & engagement](https://eu.posthog.com/project/332646/dashboard/1102625): daily and calendar-week active visitors, first/latest traffic sources, device/browser/OS, optional coarse geography, active/elapsed page time, new/returning and guest/account session segments, weekly retention, navigation paths/exits.
- [Journeys & conversions](https://eu.posthog.com/project/332646/dashboard/1102627): search to exploration to booking, checkout to verified ₹99 reservation, package interest, booking/payment diagnostics, new-account signup, sign-in outcomes, local trip brief funnel, delivered enquiry funnel, cancellation/refund/full-payment milestones.

All insights filter `analytics_environment=production`. Finance steps/series additionally filter `payment_environment=live`; do not put this filter on public pageview steps, which have no payment mode. Standard range is last 30 days and reporting timezone is the project's existing **UTC**. Daily/weekly active means unique people with a pageview per day/calendar week. Retention uses first observed pageview to returning pageview, weekly periods. These are saved operational definitions, not approved catalog metrics (the catalog was empty).

Search is `search_submitted → search_results_viewed → package_viewed → booking_started`, ordered within seven days. Checkout is `booking_started → traveller_details_completed → payment_initiated → reservation_completed [live]`, ordered within 24 hours. Signup is `auth_prompt_viewed → login_started → signup_completed` within 24 hours; returning logins belong in the separate outcome chart. Local brief and delivered enquiry are separate funnels so an offline document cannot inflate lead delivery. Funnel rates are user-level diagnostics; they do not guarantee the same booking attempt/package across repeated interactions. Use attempt/package drilldowns for transactional reconciliation. Direct checkout and guest booking remain valid workflows and need not pass every exploratory funnel step.

New auth, enquiry-delivery and post-booking panels can be empty until genuine consenting activity occurs. There is no inferred demographic segmentation, fabricated conversion, advertising audience export or promise of complete coverage. Ad blockers, consent refusal, sampling, disabled delivery, session expiry and network loss reduce observed counts. Use operational booking totals for finance, and allow the full conversion window before interpreting drop-off.

## Verification and maintenance

See [POSTHOG-VERIFICATION.md](POSTHOG-VERIFICATION.md) for actual tests, observed ingestion and explicit limits. When adding a page, register its public path in `data/analytics-public-paths.json`; when adding an event, extend the finite schema, wire the real action, add a focused privacy/idempotency regression, and update this dictionary. Never forward arbitrary `data-*`, form values, user text or URL parameters.

References: [PostHog identity](https://posthog.com/docs/getting-started/identify-users), [JavaScript SDK](https://posthog.com/docs/libraries/js), [Node SDK](https://posthog.com/docs/libraries/node), [event deduplication](https://posthog.com/docs/data/events). Instance-specific instrumentation, querying and dashboard skills were consulted through the signed-in PostHog tools.
