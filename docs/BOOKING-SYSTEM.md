# Package platform & ₹99 reservation system — 2 November 2026

The current UI now uses a one-page, mobile-only contact flow and digital tickets. See [UI-REFINEMENT.md](UI-REFINEMENT.md); the original implementation sequence below is historical.

## Repository audit and implementation plan
The retained application uses Next.js App Router, TypeScript, React, local fonts, CSS, Lucide and Zod. It had package discovery, editorial detail templates, a validated enquiry API and downloadable trip briefs. No Abhi Bus or District booking implementation, payment gateway, authentication, database or admin dashboard existed in the checked source. There was no flow to reuse beyond the existing route, photo, navigation and validation patterns.

Implementation followed this sequence: research and cost assumptions; a reusable pricing model and persisted catalog; a package-first homepage and new detail pages; three-step customization/contact/review checkout; server-side orders and verified payment settlement; private receipts and travel-date balances; authenticated admin management; automated and browser verification. The old planner/editorial routes remain available. The new explicit package routes take priority over the retained generic template.

## Product and visual decisions
The five new supplied images were used as visual references for the compact travel-app hero, category buttons, rounded image cards, clear price hierarchy and paper-like travel pass. They were not copied into the site. The light sand/ivory palette, terracotta CTAs, restrained green token accents and existing typography preserve the established JaisalGo identity. Existing licensed Jaisalmer photographs and credits remain intact. No stock person is presented as a customer, and no review, urgency count or supplier relationship is invented.

Fifteen published seed packages cover day tours, a 1-night/2-day quick escape, 2-night/3-day adventure, 3-night/4-day complete trip, 4-night/5-day royal holiday, desert weekends, couples, families, friends, backpackers, premium stays, photography, custom planning, Khuri and Tanot/Longewala. Every package has nights = days − 1 and exactly one itinerary entry per day. Longer Tanot/Longewala driving is kept as a separate day. Transfer times are editorial planning allowances, not live routing promises. Accommodation photographs illustrate destinations rather than verified rooms.

## Research sources and pricing assumptions
Reviewed 2 November 2026. Operator pages are market benchmarks, not JaisalGo contracts:

- [Rajasthan Tourism — Jaisalmer](https://www.tourism.rajasthan.gov.in/jaisalmer.html): official destination context for fort, havelis, Gadisar, Kuldhara, Sam/Khuri and Tanot; Tanot is described about 120 km from the city. Access and security requirements need reconfirmation.
- [RTDC Moomal city hotel](https://rtdc.tourism.rajasthan.gov.in/Client/HotelDetails.aspx?HotelID=JaisalmerMoomal): published AC double occupancy is ₹2,450 plus applicable GST for 11 November–23 December 2026 on a breakfast plan, and ₹3,950 plus GST for the listed Diwali period on a different meal plan. These are property/date-specific benchmarks; the seed city cost is an estimate, not this hotel’s offer.
- [RTDC Sam Dhani](https://www.rtdc.tourism.rajasthan.gov.in/Client/HotelDetails.aspx?HotelID=JaisalmerSamDhani): the displayed 2–10 November 2026 Diwali tariff differentiates AC double occupancy at ₹5,750 and non-AC/tent double occupancy at ₹5,000, with applicable GST extra. The listed plan includes meals, camel safari and cultural programme. These rates apply to that property and period only.
- [Elite Heritage Camp tariff](https://eliteheritagecamp.com/packages/): standard two-guest accommodation tariffs begin at ₹3,500 plus tax for a cottage and ₹4,000 for a Swiss tent. Festival periods and New Year have separate rates. Published meal-plan and tax conditions differ by season; use a dated quote.
- [Sam Jaisalmer Desert Camp activities](https://samjaisalmerdesertcamp.com/activities/): advertised rides vary by duration and occupancy, including a short four-person jeep option at ₹1,999. This supports separately configurable activity allowances rather than a blanket “safari included” claim.
- [Sam Sand Dunes Camp tariff](https://www.samsanddunescamp.in/tariff.php): provides meal, transfer and safari examples, but its season/date text is ambiguous. It was not used as a confirmed current rate.
- [Razorpay pricing](https://razorpay.com/pricing/): payment-method and promotional conditions can vary. The seed 2.36% gateway allowance is a configurable conservative modeling assumption, not a claim that it is every merchant’s current contracted fee.

Seed costs are original provisional models: standard city room ₹2,200/night for two, camp room ₹3,500/night for two, route-dependent vehicle allowances, per-person activities and meals, and a group operations allowance. Budget/premium packages scale those assumptions. The optional jeep allowance is ₹1,800 per vehicle (up to four), and private guide allowance ₹1,500 per group; these are not supplier quotes. The seed 5% supplier-tax allowance is illustrative, not a legal determination. An administrator must replace it with correctly reviewed tax-inclusive supplier costs/allowances before live collection.

## Pricing engine
`lib/booking/pricing.ts` stores costs in integer paise. Room count is `ceil(travelers/2)`; vehicles are `ceil(travelers/4)`. City and desert nights, transport, activities, meals, operations and chosen extras are itemized. Stay multipliers affect accommodation only.

Let `C` be estimated operating costs including the configured supplier-tax allowance, `m` the desired net margin and `g` the gateway fee allowance as a fraction of the customer total:

`Selling price = C / (1 − m − g)`

With no gateway rate this reduces to the requested `C / (1 − 0.10)`. The model is rejected if the total cannot cover the ₹99 token. Rounding includes a small paise cushion for two payment fee roundings. Target margin cannot be below 10%. Final profit is an estimate based on supplied inputs, not a guaranteed business result. ₹99 is deducted from the full group total. Per-person card estimates are rounded upwards and explicitly based on two travelers sharing a room; checkout shows the exact group total.

## Data and payment model
`@libsql/client` provides a local SQLite database by default at `.data/jaisalgo.db`, or a configured remote libSQL database. The private data directory and all databases are excluded from source archives. Persist and back up the data volume on deployment. Package JSON is seeded with insert-if-absent, so restarts do not overwrite admin edits.

Tables: `tours`, `departures`, `drafts`, `payments`, `bookings`, `events`, `audits`. Departures and occupancy are separated by demo/test/live environment. Transactions serialize capacity checks and settlement. A 15-minute pending hold is distinct from a booking. Quote, costs, itinerary, traveler choices, policy acceptance timestamp and terms are snapshotted. Admin edits cannot change an existing booking’s terms or price.

Payment states include creating, pending, authorized-awaiting-capture, failed, captured, refunded, unknown order and reconciliation/refund required. Idempotency keys, unique order/payment/draft constraints and transactional fulfillment prevent duplicate confirmation. An API timeout during order creation is marked unknown rather than blindly retrying an external order. Late captured payments after expiry or lost capacity go to reconciliation; no booking is created. Before opening real checkout, the browser checks the current hold again.

Razorpay integration creates orders on the server, validates the checkout HMAC using the stored order ID and fetches the provider payment to check captured status, order, INR currency and exact amount. Signed webhooks use the raw request body, deduplicate deliveries and independently fetch provider payment data. Refund updates are monotonic; a refunded event arriving before captured reconciliation does not accidentally confirm travel.

References: [Standard Checkout integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps), [webhook validation and idempotency](https://razorpay.com/docs/webhooks/validate-test).

## Running and configuring
1. Use Node 20.9+; install with `npm ci`. `npm run dev -- -p 3001` runs the development preview. Production: `npm run build`, then `npm start -- -p 3001`.
2. Default `BOOKING_MODE=demo` requires no payment credentials. Success/pending/failure buttons are explicit simulations. Demo receipts do not represent money, a supplier contract or real travel availability.
3. Run `npm run admin:setup` to choose a local admin password, then restart. The helper writes private `.env.local` values; no default password is shipped. The helper rejects quote, backslash and dollar characters to avoid dotenv escaping ambiguity. A 12+ character password is required. `/admin` is protected by a signed, four-hour, HttpOnly SameSite cookie and same-origin mutations. Use HTTPS when deployed.
4. For a Razorpay test integration set `BOOKING_MODE=test`, test key ID, secret and webhook secret. Configure `/api/payments/webhook` on a reachable staging host and subscribe to `payment.captured`, `payment.failed` and `payment.refunded`. Configure auto-capture in the provider dashboard. Live credentials were not supplied and no real provider payment was executed here.
5. Live collection requires explicit `BOOKING_MODE=live`, matching live credentials, webhook secret, verified `NEXT_PUBLIC_WHATSAPP_NUMBER`, `BOOKING_BUSINESS_NAME`, reviewed package supplier costs/taxes, non-draft cancellation terms and live-environment departure capacity. Seed packages are deliberately unconfirmed. Complete the business/privacy/retention details before real customer collection.
6. For hosted/multi-instance operation use a shared persistent libSQL database and an edge/shared rate limiter with a trusted client-IP source. The in-process request limiter is bounded but is not a distributed abuse-control service. Arrange operational reconciliation for unknown orders and late captures.

## Admin and balance workflow
The travel desk adds/edits/publishes/unpublishes tours, chooses licensed photo IDs, edits itineraries/inclusions, recalculates costs/margin, manages dates/capacity, and lists bookings and payments. Package revision checks reject stale edits. Revenue and costs are split by environment; demo/test values never appear as live revenue. Recorded expenses are distinct from estimated costs. Cash received less recorded expenses is not labelled final profit.

Online balance payment opens on the travel date, with a separate order and duplicate protection. Authenticated staff can record an approved offline balance only on/after that date with a unique receipt reference. A concurrent online balance attempt must be reconciled first.

Cancellation and live refund actions create review requests. An authorized operator reviews the accepted policy and issues an approved real refund in the Razorpay dashboard; the signed refund webhook records actual refunded funds. The app does not invent refunds or automatically transfer money based on an unreviewed draft policy. Demo full refunds are available for testing. Live refund initiation, SMS delivery and supplier booking APIs are not configured integrations.

## Verification
- Fourteen Node tests passed: pricing/occupancy/margin, terminology/admin validation, no booking before capture, idempotency, wrong amount/currency/order rejection, concurrent capacity, expiry, due-date balance restrictions, balance settlement, monotonic refunds, signatures, out-of-order refunds and live gating. Mocked Razorpay checkout/webhook tests verify signatures and one-time fulfillment without making provider calls.
- Production webpack build and TypeScript passed.
- Isolated HTTP admin integration passed: authentication/cookies, CSRF, hidden/published products, stale edit rejection, dates, duplicate requests, pending/failed/success demo payments, early balance rejection, approved offline receipt, expense entry, cancellation/refund ledger and logout. Reproduce after building with `npm run test:admin` (Python 3 standard library, temporary DB and ephemeral local port; no real credentials).
- In-app browser: mobile customization of a three-person trip with optional jeep; date and total preserved; pending/failed states did not confirm; successful simulation reached a receipt with ₹99 deducted, correct balance/date, disabled early balance payment and a working itinerary/receipt download. Search empty state/reset and five-day filtering were exercised, along with mobile detail sticky booking bar.
- Production dependency audit reported zero production advisories at this check. Development dependencies had moderate advisories; no broad dependency migration was performed.
- Full browser-runner/axe and field Core Web Vitals scores are not claimed. The earlier sandbox browser-launch limitation remains documented in `VERIFICATION.md`. Real payment settlement, live refunds, supplier availability and external delivery still require credentials/configuration and staging validation.

## Reliability audit additions — 3 November 2026

See [BOOKING-AUDIT.md](BOOKING-AUDIT.md) for current findings, controls and launch limits. The original API actions remain. Added `availability`, `resume`, `prepare` and `abandon` actions support the existing flow; reviewed total/revision fields are optional for legacy callers. A separate `payment_exceptions` table records duplicate captures without inflating a booking's paid amount; operator cash metrics and review details include these receipts/refunds. Departure queries now use indexed SQL sums.

Optional `costs.departureRates` entries have an exact `date` and any of `roomNight`, `campNight`, `transport`, `activities`, `meals`, `operations`, all integer paise. Unspecified fields retain the base cost. No festival surcharge is preloaded. Operator validation checks these dated models before saving. Capacity continues to represent traveller places for a specific package/start date/environment; it is not a shared nightly room/vehicle inventory integration.
