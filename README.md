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

Twenty-five domain/payment/privacy/ticket/marketplace tests and the isolated HTTP admin integration passed. `test:admin` requires Python 3 and a completed build; it uses a temporary DB and private generated test credentials. The full Playwright suite includes additional UI/axe scenarios, but the prior browser-launch limitation means those assertions are not claimed as passing. Real browser checks used the in-app browser.

Read [docs/UI-REFINEMENT.md](docs/UI-REFINEMENT.md) for the current input, ticket and private-access design.

Read [docs/BOOKING-SYSTEM.md](docs/BOOKING-SYSTEM.md) for source-linked research, cost assumptions, architecture, setup, verification and operational boundaries. Earlier brand research and design history remain in `docs/RESEARCH.md`, `docs/REDESIGN.md`, `docs/GALLERY-THEME.md` and `docs/ROYAL-THEME.md`. Original photography attribution and adaptation downloads remain at `/photo-credits`.

## Conversion analytics

Open Travel desk → Analytics after administrator sign-in. See [metric definitions, privacy, configuration and rollout](docs/ANALYTICS.md). Analytics is first-party and optional; verified deposit, full payment and actual trip completion remain distinct. No third-party vendor or new email collection is installed.

For Vercel, follow [persistent database setup](docs/VERCEL-DEPLOYMENT.md). The site remains browsable before connection; online booking requires shared durable libSQL storage.
