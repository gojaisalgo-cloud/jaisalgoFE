# Booking reliability and UX audit — 3 November 2026

## Scope and outcome

Improved the existing Next.js application in place. Existing routes, API actions, package catalogue, operator desk, payment integration, ₹99 token/balance rules, private tickets and visual system remain. No accounts, customer email, discounts, payment vendor or supplier integration was added.

The normal journey remains: package → date and total travellers → essential name/mobile and price → payment → ticket. Customisation and detailed costs are expandable. Only a changed quote, an interrupted checkout or a payment exception adds a recovery action.

## Findings addressed

| Finding | Isolated improvement | Verification |
| --- | --- | --- |
| Availability was discovered only after entering details | Read-only date/group check beside the date; unavailable groups cannot proceed; final capacity still checked transactionally | Sold-out, insufficient capacity, expiry and concurrent holds |
| A changed catalogue price could replace the displayed estimate at submission | Current client submits reviewed total and revision; server re-reads the package within the write transaction and returns `409 PRICE_CHANGED` before any order/hold | Price, revision and immutable snapshot tests |
| Retry keys could be reused with changed details, and catalogue edits could obstruct replay | Compare the original intent, return the original checkout on a genuine replay, and reject changed intent; replay occurs before current catalogue validation | Replayed edits/unpublished package, changed contact/access |
| Failed payment retry could lose its released places | `prepare` reclaims available capacity inside a transaction before the gateway opens; expired/authorized/review states cannot open another payment | Lost-capacity retry, authorized hold and expiry tests |
| Duplicate captured payments were silently ignored | Separate `payment_exceptions` ledger and operator review state; no extra booking or inflated contract payment; exception refunds reconcile independently | Duplicate delivery/capture, cross-order ID, refund tests |
| Authorized verification did not check all provider order facts | Validate order, currency, exact amount, environment and payment reference before any state change | Mock provider mismatch and signed webhook tests |
| Refunded capture or stale event could give misleading status | Reconcile provider refund facts first; stale failure cannot override a captured provider status; cancellation/refund records have distinct ticket headings | Refunded-before-capture, monotonic refund and status tests |
| Network loss and navigation could require retyping | Bounded JSON requests with useful retry text; two-hour session form recovery; access-bound unfinished checkout lookup; selections/contact survive restart | Client failure tests and real browser return/expiry recovery |
| Children were only implicit in the total | Optional children-within-total control, at least one adult, visible allowance and eligibility explanation, saved on ticket | Adult/child boundaries, family mobile checkout, live quote gate |
| Date-specific allowances were unavailable | Optional exact-date `costs.departureRates` overrides, with unchanged base fields retained and date rate labelled before payment | Date selection, validation and server snapshot tests |
| Mobile price details and downloaded ticket were incomplete | Expandable mobile cost/tax/service breakdown; snapshot venue/stay/meals/transport; include itinerary and accepted cancellation terms in PNG ticket | Browser checkout, ticket and inspected PNG |
| Availability read every full booking payload | Indexed departure lookups and SQL sums scoped to package/date/environment | Existing capacity and settlement regression tests |
| Operator edits could race payment changes | Compare-and-swap cancellation/refund/expense updates; reject capacity below existing booked/held places and invalid departure dates | Admin HTTP integration and service tests |

## Traveller and pricing boundaries

All 1–12 traveller counts, three stay allowances and private/single/shared occupancy modes are exercised in a 2,592-case pricing matrix, alongside unit-specific activities, tents, vehicles, priced extras and per-service tax tests. Rooms use the existing two-person occupancy or single-occupancy rule. Children count within the traveller total, occupy capacity and use the same provisional allowance. No free-child, extra-bed, child-age band or automatic sharing discount is invented.

Child tariffs/eligibility, group matching, alternative properties, shared rooms and unpriced extras require supplier confirmation before live payment. A date override represents the price for that departure; it is not a nightly inventory calendar. Base prices remain unchanged when no dated override exists. Client totals, arbitrary discounts and coupon fields never determine the server price.

## Data and compatibility

Existing API actions remain available. Additive actions: `availability`, `resume`, `prepare`, `abandon`. Current checkout sends optional `expectedTotal`/`expectedRevision`; legacy callers retain server-priced behavior. New optional fields preserve old package and booking records. Issued prices, policies and itineraries remain immutable snapshots. Schema additions use create-if-absent; no private database was reset or seed record overwritten.

Form contact data stays in this tab's session storage and is reused for up to two hours, cleared after successful booking. It is not added to URLs. Ticket keys remain private; the QR opens the same access-protected booking record. No unverified mobile lookup or authentication bypass was introduced.

## Launch conditions and limits

This is a verified local demo/test implementation, **not certification that live sales are ready**. The seeded rates, venue inventory, child terms and taxes remain provisional. Real collection requires contracted supplier rates/venues, dated live capacity, accepted refund terms, business/support configuration, gateway credentials and staging capture/refund/webhook validation.

Capacity is per package, departure date and environment. Separate packages/dates do not share an automatic physical room/vehicle pool. An operator must reconcile overlapping supplier allotments before entering live capacity; integration with a supplier inventory system is not configured. Child or shared-group requests cannot be automatically sold with the current unconfirmed tariff data.

Unknown provider orders and duplicate/late captures require operator reconciliation. Real refunds are issued through the existing provider workflow, then reconciled by signed webhooks. Shared persistent storage, backups, HTTPS, trusted-proxy/distributed rate limiting and operational reconciliation remain deployment responsibilities. Tests use temporary databases or clearly labelled fake-contact demo checkouts; no real payment, supplier reservation or message was sent.

A browser-launch limitation on this host still prevents the full Chromium/axe runner. HTTP route/API tests and in-app browser checks are recorded separately; no exhaustive accessibility certification or every possible production failure is claimed.

## Static-analysis follow-up

The optional ESLint run is not clean. React compiler/hook rules flag JSX inside an operator-editor parsing try/catch, external-data/state hydration effects, a render-time payment-expiry clock and effect dependencies. The ticket QR image also raises the Next image advisory. These were not silenced or turned into a broad core-flow rewrite in this targeted pass. Build/TypeScript, domain tests and HTTP/manual integration results are separate evidence; a green lint or exhaustive production certification is not claimed.
