# JaisalGo

A Jaisalmer package-discovery and ₹99 reservation application built on the existing Next.js App Router, TypeScript, React, CSS, Lucide and Zod stack. White surfaces, restrained forest accents, documentary destination photography and a simple, account-free booking interface.

## Run

Use Node 20.9+ (this host has Node 20.20.2).

```sh
npm ci
npm run dev -- -p 3001
```

Production preview:

```sh
npm run build
npm start -- -p 3001
```

Open http://127.0.0.1:3001. Scripts pin child tools to npm’s Node runtime and use webpack on this host. Fonts and images are local. Dev mode uses Watchpack polling for the host watcher limit.

## What works

- Twenty-four seeded tours, camp-only stays, cultural evenings and short activities. Search, type/budget/duration filters, per-person estimate sorting and shareable filter URLs.
- Visible information button on every card: overview, itinerary, stay/venue details, price and extras in a mobile sheet. Preferences carry into checkout; direct package URLs remain available.
- Integer-paise cost model with room/vehicle occupancy, supplier-tax and gateway allowances, at least 10% configured target net margin, explicit person/tent/vehicle card basis and exact full-group checkout total.
- One-page date/options/name/mobile checkout, persisted 15-minute holds, server quote snapshots, explicit demo payment states and instant private digital tickets. No email collection.
- Downloadable PNG tickets, native share/copy-link fallback, private QR links and a My Bookings section. Tickets saved on this device need no customer login.
- Razorpay server order creation, checkout signature/captured-payment verification and raw-body signed webhooks. No real payment credentials are included.
- Separate balance payment on the travel date, authenticated approved-offline receipt recording, duplicate prevention, cancellations, refund tracking and late/unknown-payment reconciliation states.
- Protected admin tour editing/publishing, photo-library selection, cost recalculation, itinerary/inclusion editing, departure capacity, booking/payment review and expenses. Live, gateway-test and demo accounts remain separate.
- Original places, experiences, guides, itinerary, planner and validated enquiry/download routes are retained.

## Demo and live boundaries

Default mode is **demo**. No real money or travel reservation is made. Prices are researched provisional models, not verified supplier rates or live availability. ₹99 is part of the total, not a fee on top.

Admin sign-in has no default password. Run `npm run admin:setup`, choose a password and restart the server. Open `/admin`. `.env.local` and `.data/` are private and excluded from source packages.

`.env.example` describes the optional gateway, database, admin and verified-contact configuration. Real checkout is gated on explicit live mode, matching credentials, webhook secret, verified contact/business information, reviewed supplier/tax costs, non-draft refund policy and a live departure with capacity. Use a persistent/shared database and HTTPS for deployment. No supplier integration, SMS service or live refund initiation is invented: approved live refunds are issued in Razorpay and reconciled by signed webhook.

## Files and tests

- `data/catalog.ts` / `data/discovery-tours.ts`: provisional seed inventory and route plans; stored admin edits take precedence.
- `app/finishing.css`: final typography, contrast, spacing and interaction refinements.
- `docs/PACKAGE-MARKETPLACE.md`: package information model, research, charging units, sharing, add-ons and live boundaries.
- `lib/booking/`: pricing, SQLite/libSQL storage, request/admin security, Razorpay adapter and transactional reservation service.
- `components/booking/`: package cards/catalog, checkout, digital tickets, saved bookings and admin workspace.
- `app/minimal.css`: active white product theme; `app/booking.css` retains the shared commerce layout.
- `app/api/booking`, `app/api/payments/webhook`, `app/api/admin`: backend workflows.

```sh
npm test
npm run typecheck
npm run build
npm run test:admin
```

The current suite covers domain, payment, privacy, ticket, marketplace, SEO, analytics and booking-alert behavior; see the dated release reports for verified counts. The isolated HTTP admin integration is documented in the latest verification report. `test:admin` requires Python 3 and a completed build; it uses a temporary DB and private generated test credentials. The full Playwright suite includes additional UI/axe scenarios, but the prior browser-launch limitation means those assertions are not claimed as passing. Real browser checks used the in-app browser.

Read [docs/UI-REFINEMENT.md](docs/UI-REFINEMENT.md) for the current input, ticket and private-access design.

Read [docs/BOOKING-SYSTEM.md](docs/BOOKING-SYSTEM.md) for source-linked research, cost assumptions, architecture, setup, verification and operational boundaries. Earlier brand research and design history remain in `docs/RESEARCH.md`, `docs/REDESIGN.md`, `docs/GALLERY-THEME.md` and `docs/ROYAL-THEME.md`. Original photography attribution and adaptation downloads remain at `/photo-credits`.

## Conversion analytics

Open Travel desk → Analytics after administrator sign-in. See [metric definitions, privacy, configuration and rollout](docs/ANALYTICS.md). Analytics is first-party and optional; verified deposit, full payment and actual trip completion remain distinct. Optional PostHog browser and verified-backend instrumentation now complements the private first-party report; no email collection is added. See [PostHog activation, event dictionary, dashboard recipes and verification limits](docs/POSTHOG_ANALYTICS.md). Tracking stays off without a public project token/host and consent.

For Vercel, follow [persistent database setup](docs/VERCEL-DEPLOYMENT.md). The site remains browsable before connection; online booking requires shared durable libSQL storage.

## Search discovery and SEO

The canonical production origin is `https://www.jaisalgo.com`. Public pages have individual titles, descriptions, social cards and safe JSON-LD; package details are server-rendered behind the existing tabs. Dynamic sitemaps include published packages and source-dated guides. Private pages remain noindex and protected by the existing access checks. No provisional estimate or ₹99 deposit is represented as a full-price structured offer.

```sh
npm run audit:seo -- --base-url http://127.0.0.1:3001 --json /tmp/jaisalgo-seo-audit.json
```

Start a production preview before the HTTP audit; it uses Python 3 with no additional packages. See [implementation and verification](docs/SEO-IMPLEMENTATION.md), [the prioritized audit](docs/SEO-AUDIT.md), [keyword-to-page mapping](docs/SEO-KEYWORDS.md), and [Search Console setup, analytics and the 30/60/90-day plan](docs/SEO-OPERATIONS.md).

See the [10 November SEO release](docs/SEO-RELEASE-2026-11-10.md) for the earlier 89-page inventory, validation and Google setup status. Real field metrics require Google processing. Repository-wide lint currently reports 13 pre-existing errors and 9 warnings; comparison with the preceding commit found no new diagnostics from this change. They are documented separately from successful SEO/build/booking checks.

### Generative search and answer-first guides

The 10 November GEO release expands the canonical inventory to 93 URLs, including Pune, stay-area and night-planning guides and editorial standards. It adds 39 direct-answer articles, 13 attraction entities and consented AI referral reporting. See [GEO audit](docs/GEO-AUDIT.md), [measurement definitions](docs/GEO-MEASUREMENT.md) and [release verification](docs/GEO-RELEASE-2026-11-10.md). Bing verification awaits a genuine owner token; AI citations and field performance require observation.

### Pan-India travel discovery

Eleven source-reviewed origin guides live under `/jaisalmer-travel-from`, with a region-grouped directory, canonical alias redirects and a shared publication gate. The 103-market research backlog never generates public pages automatically. See [implementation and 90-day plan](docs/PAN-INDIA-SEO.md), [keyword candidates](docs/PAN-INDIA-KEYWORDS.csv) and [verification](docs/PAN-INDIA-VERIFICATION.md). Local package booking and live payment gates remain unchanged.

### Real bookings and assistance

Public deployments default to live mode and require real credentials, shared storage, reviewed suppliers and date capacity. Demo mode must be selected explicitly for isolated testing. Book now uses ₹99 towards the total; the balance is due at check-in or on the visit date. Call assistance: 8824548099. See [real booking activation and verification](docs/BOOKING-LAUNCH.md).
