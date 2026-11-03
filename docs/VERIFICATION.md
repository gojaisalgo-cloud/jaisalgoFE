# Verification record

## Completed checks

- Strict TypeScript check: passed.
- ESLint: passed without warnings after fixing configuration and runtime-launcher imports.
- Domain tests: 5 passed (combined filtering/inventory immutability; search/empty/sort; validation and honeypot; brief wording; unique/substantive editorial content).
- Production build: passed using Next.js 16.4.3 webpack. First Turbopack build also passed when launched directly, but npm-environment retries exposed a CSS worker using an inherited x64 Node runtime. Project scripts now select a consistent runtime and use supported webpack compilation.
- HTTP route/link test: passed for all published routes, sitemap, robots, assets and internal href targets; invalid detail route returned 404.
- API test: passed for cross-origin (403), invalid content (400), honeypot (400), body size (413), unconfigured service (503) and rate limit (429).
- Dependency installation audit: zero reported vulnerabilities at install time.

## Real browser preview checks

Used the Codex in-app browser, with explicit 1440×1000 desktop and 390×844 mobile viewports.

- Visually inspected desktop hero, quick planner and discovery layout, and mobile hero/navigation/package details.
- Quick planner selected 3 days + Couples and navigated to `/packages?days=3&style=Couples`; three matching trip briefs rendered.
- A non-matching search displayed the useful empty state; Clear filters restored all 14 briefs.
- Longest-first sorting changed the URL and moved a four-day trip to the first position.
- Mobile menu opened, closed with Escape and reported `aria-expanded=false` afterward.
- Checked mobile document width against viewport width: 390/390, no horizontal overflow on package discovery or planner.
- Empty form submission focused the required name field and its validity was false.
- Filled fictitious test details, travel month, interests and consent; trip brief generated with three-day/two-traveler summary and recommendations.
- Download button produced `my-jaisalmer-trip.txt`; the UI explicitly said no enquiry had been sent.
- Browser console error log was empty on the tested planner journey.
- Package detail navigation rendered the itinerary, gallery, quote-required panel, cancellation guidance and preselected package in the form.

## Environment limitations and honest scope

The installed Chrome process aborted with SIGABRT when launched by the Playwright browser runner in this sandbox. The HTTP-only Playwright tests worked; the four browser-driven tests did not execute their assertions successfully. Their source remains included for rerunning on a supported host, with optional `PLAYWRIGHT_EXECUTABLE_PATH`. In-app browser checks above are separate manual automation results, not a claim that the full Playwright suite passed.

Automated axe checks are present in the browser suite but could not run because the browser failed to launch. Semantic structure, labels, visible focus styles, responsive layout, native validation, Escape behavior and reduced-motion CSS were inspected; this is not a full WCAG 2.2 conformance audit. No field Core Web Vitals or Lighthouse score is claimed. Current travel availability, verified suppliers and live webhook delivery were not tested because no business integration was supplied.

## Premium redesign follow-up — 25 October 2026
The redesigned build passes typecheck, lint, all six domain tests, production build and the two HTTP route/API tests. Responsive and functional checks were completed in the in-app browser at five widths. Full details, corrected package duration default, motion-check limits and image/font provenance are in `docs/REDESIGN.md`. The original runner limitation above still applies; it is not a claim that the full browser/axe suite passes.

## Reference gallery theme — 25 October 2026
The current landing page has a rounded fort hero, three prominent Book now package links and a layered destination gallery. Typecheck, lint, six domain tests and production build passed. In-app browser checks verified mobile navigation/Escape, gallery category and next controls, the hero package anchor and the package enquiry route with correct package/duration initialization. See `GALLERY-THEME.md` for scope and final visual checks.

## Light royal Rajasthani theme
The active theme is now light ivory, sandstone, maroon and antique gold. Production build and TypeScript passed; the route/internal-link HTTP test passed. Desktop, tablet and phone layouts, gallery controls, mobile navigation, Book now routing and light enquiry fields were checked in the in-app browser. Details and current design files: `ROYAL-THEME.md`.

## ₹99 package platform — 2 November 2026
The current package-first platform adds 15 persisted products, a provisional pricing model, checkout, SQLite/libSQL holds/bookings/payments, Razorpay verification/webhooks, private receipts, travel-date balances and an authenticated admin desk. Fourteen Node tests and the isolated admin HTTP integration passed. Real in-app browser checks completed the mobile demo booking, failure/pending/success states, correct ₹99 deduction, receipt download, five-day package filtering and sticky mobile CTA. No real money was charged. See `BOOKING-SYSTEM.md` for research, setup and limits.

Final production verification passed: Next.js webpack build and TypeScript, all 67 generated pages, and both HTTP-only Playwright route/API tests. Homepage document width matched the viewport at 360, 390 and 768 pixels; the five-day detail also fit 360 pixels. Desktop and phone screenshots were saved alongside the source archive. The production preview remains on port 3001. Full Chrome/axe execution remains subject to the host limitation described above.

## Minimal booking and digital tickets — 2 November 2026

The current white theme replaces the ivory/terracotta product treatment. Checkout is one form with date/group defaults, name/mobile, collapsed optional upgrades and explicit policy consent. The local trip planner requires only travel period, group size and duration. No customer account is needed.

- Eighteen Node tests passed, including normalized mobile contact, exclusion of unwanted personal fields, private ticket links, safe ticket export and gateway contact configuration. TypeScript and the 68-page production build passed.
- Isolated admin integration and both HTTP-only route/API tests passed after the changes. Admin, date capacity, duplicate protection, travel-date balances and refund reconciliation remain functional.
- Existing database snapshot migration was verified: zero old address fields remained in both drafts and bookings. Old reservations also appeared in My Bookings. Importing a saved private link reopened the correct ticket and removed its fragment from the address bar after local access was saved.
- In-app browser: booking at 360 pixels with a changed date, three travelers and jeep option showed ₹26,538 total, ₹99 token and ₹26,439 balance. One primary booking action opened the digital ticket; date, group and amounts matched. Ticket heading received focus and page scroll reset to the top.
- Ticket QR rendered as a generated PNG. Download Ticket created a PNG file, inspected visually with correct booking facts and a QR. Share Ticket exposes the device share/copy path; no message was sent to another person during verification.
- My Bookings listed old and new demo tickets. The local planner generated a brief without name, mobile or address fields. Phone and tablet document widths matched their viewports at 360, 390 and 768 pixels. Desktop ticket was inspected at 1440 pixels.
- No real charge, supplier admission validation, live OTP/SMS delivery or full axe/Lighthouse conformance is claimed. The existing browser-runner host limitation remains unchanged. See `UI-REFINEMENT.md` for access and sharing boundaries.


## Shared dropdown refinement — 2 November 2026

Native option popups were replaced across the planner, booking, filters and admin with a shared Radix Select component. The white rounded panel uses subtle shadows, contextual icons, selected checkmarks and a restrained highlighted row. No account/profile features from the reference image were added.

Production build and TypeScript passed. In-app browser verified arrow-key selection, typeahead, Escape with focus restoration, mobile popup collision handling and no horizontal overflow at 390 pixels. A downloaded planner brief retained Premium and five days. Package duration filtering selected the five-day royal holiday; Any duration restored all 15 packages. Changing booking travelers to three recalculated the group total to ₹24,382. No console errors were recorded during these checks. The existing full Chrome/axe runner limitation still applies.


## Package badge emphasis
Duration pills now use a larger clock, bolder text and a solid white surface. The token badge emphasizes ₹99 with a stronger green border and a separate “Part of total” line. Production build and TypeScript passed; desktop card layout and 360-pixel document width were checked in the in-app browser.


## Compact package cards — reference redesign

The shared card now follows the white reference variant: inset rounded image, concise destination/title/description, a compact stay/meals/transport row, separate full estimate and ₹99 token, and visible package/booking links. Detailed highlights remain on the package page. No review scores or unimplemented favorites were copied from the reference. Day tours show “1 day” and a group pricing basis without twin-sharing language.

Production build and TypeScript passed. In-app browser checks at 1440 and 390 pixels showed no horizontal overflow. The first desktop row aligned at about 575 pixels tall; day-tour cards on mobile were about 571–599 pixels. The card booking link opened the correct day-trip checkout with its matching total. Desktop grid and mobile card screenshots were saved alongside the refreshed source archive.

## Package information marketplace — 2 November 2026

- Expanded the seed catalogue from 15 to 24 products without resetting existing database rows or issued ticket snapshots. Every package card, including legacy collection cards, has a package-information button.
- 23 Node tests pass. New assertions cover explicit activity/tent/vehicle units, vehicle rounding, single occupancy, per-service tax, priced extras, preference URL allowlisting, shared travel versus private accommodation, server-owned request snapshots and live rejection of unquoted options/unknown venues. Existing capture, concurrency, refund, privacy and ticket tests remain green.
- Production webpack build and TypeScript pass. All 68 generated editorial/static routes remain available; package routes are dynamic, including the nine new products.
- Isolated admin HTTP integration passes after catalogue expansion: authentication, CSRF, publication, stale-edit checks, departures, idempotent demo payment states, balance/offline receipts, expenses and refund ledger. Uses a temporary database; no live credentials or transactions.
- Two HTTP-only Playwright checks pass: all published routes/internal links (including the new products), and API origin/validation/body/delivery/rate-limit behavior. Full Chromium/axe automation remains outside the verified scope on this host.
- In-app browser verified three-person Swiss-camp estimate recalculation, working dropdowns inside the native dialog, independent shared travel with private accommodation, unpriced quad request, and preference handoff into checkout. A fake-contact demo checkout produced an immediate private QR ticket with the same ₹9,129 total / ₹9,030 balance and the selected request clearly excluded from the quote.
- Mobile 390px and desktop 1440px layouts have no horizontal page overflow. Mobile information sheet stays inside its viewport. Escape closes the modal and returns focus to its card button. Cultural venue/show timing remains visibly unconfirmed, with area-search links distinguished from actual venue pins.
- The final source archive excludes databases, environment secrets, dependencies, build/cache outputs and test artifacts. Production preview remains at http://127.0.0.1:3001/packages. Demo mode takes no real payment and confirms no supplier inventory.

## Final finishing pass — 2 November 2026

- 25 Node tests pass, including valid/impossible/expired travel dates, leap-day handling, URL date preservation without customer contact data, and friendly API validation. Existing pricing, supplier gates, capture/refund, ticket and privacy tests remain green.
- Production build and TypeScript pass. Isolated admin HTTP integration passes after the booking error/date changes.
- In-app browser at 390px: selected three travelers, single-occupancy tents and transfers; chose 10 Nov; returned to the package and back to checkout with the same options/date and ₹16,431 full estimate. An invalid mobile produced a readable focused error. Correcting the fake test contact completed a demo checkout with a private QR ticket, ₹99 simulated token and ₹16,332 balance. The ticket appeared in My Bookings.
- Mobile navigation closes with Escape and when the page outside it is clicked. Homepage filtered continuation retained `style=Couples`.
- The 320px check caught a 3px category-rail overhang caused by a narrow-screen padding difference. The rail margins now follow the 17px page gutter. Detail sheet width remains within the viewport, and narrow-screen footer controls wrap without clipping.
- Desktop/mobile screenshots and the sanitized source ZIP were refreshed. Demo mode remains enabled; no real charges, supplier bookings or external messages were made. Full automated browser/axe and live settlement remain outside verified scope.

## Colour and typography pass — 3 November 2026

- Replaced the final style layer with consistent ivory/white surfaces, charcoal text, sandstone gold and forest actions. Editorial/discovery headings use the existing local Cormorant font; booking controls and facts retain local Manrope. No font downloads or new dependencies were introduced.
- Production webpack build and TypeScript passed after the visual changes. This pass changes CSS and documentation only; booking/payment behavior was not modified.
- In-app browser checked desktop 1440px and mobile 390px/320px: homepage, package cards, detail sheet and selection menu, trip planner, checkout, saved bookings, a previously issued demo ticket and travel guide/article. Page widths matched the narrow viewports. The 320px detail sheet stayed within its 318px content width; card actions stack without clipping.
- Browser-computed styles verified the display font and dark heading colour, 24px mobile card titles, 16px booking inputs, 22px checkout section headings, 14px consent text and 25px dark payment amount. Selected category icons, light ticket-stub branding and narrow ticket-payment wrapping were corrected during inspection.
- Calculated palette contrast against the ivory canvas: main text 13.69:1, supporting text 5.55:1 and gold 4.89:1. White on the forest primary action is 9.69:1. These are token-pair calculations, not a full-page accessibility audit; photo overlays and every interaction state were not exhaustively measured.
- Fresh desktop/mobile screenshots and the sanitized source ZIP were saved. Production preview runs at http://127.0.0.1:3001/. No real payment or new supplier reservation was made.

## Booking reliability and simplicity audit — 3 November 2026

- 37 Node regression tests passed. The added scenarios cover stale quote/revision conflicts before order creation, idempotent replay after catalogue edits, changed request rejection, sold-out/expired capacity, failed retry reclamation, 2,592 pricing combinations, dated rates, child/adult limits, duplicate captures, cross-order references, refund-before-capture, zero/invalid refunds, private checkout recovery, network-response failures, authorized-payment mismatch and ambiguous balance-order failure. No provider network calls occur in these tests.
- TypeScript and production webpack build passed. The 68 generated routes remain; no public route or existing API action was removed.
- Isolated admin HTTP integration passed after the capacity/index changes: authentication/cookies/CSRF, private/public catalogue, stale edits, valid/invalid departures, capacity below held places, availability/prepare/resume actions, pending/failed/captured demo states, duplicate protection, early balance, offline receipt, expenses, cancellation, repeat refund rejection and logout.
- Both HTTP-only route/API checks passed against a temporary database and explicitly disconnected enquiry endpoint. Published routes/internal links resolve; cross-origin, validation, oversized request, missing delivery and rate-limit behavior remain intact. No enquiry or external message was sent.
- In-app browser at 390px: three travellers including one child, private single occupancy and 12 Nov were retained through Back to package → Choose date, including fake contact values. Demo checkout issued ticket JG-771173D012 with ₹31,211 total, ₹99 simulated token and ₹31,112 balance. Its QR and downloadable PNG were inspected; the PNG includes saved itinerary, venue status, stay, meals, transport and accepted refund terms.
- A separate fake-contact demo checkout exercised pending and failed states with no ticket, then expiry and restart. Recovery retained date, traveller choices and contact values. The fixture was abandoned; no real payment or supplier reservation occurred. Session recovery and expiry evidence are distinct from real gateway settlement.
- Full Chromium/axe automation remains unavailable on this host. Actual supplier room/vehicle pools across overlapping products, live child tariffs, live payment/refund settlement and distributed production operations remain outside the verified local scope. See BOOKING-AUDIT.md for the complete findings and launch boundaries.

## Directional control finishing pass — 3 November 2026

- Replaced 46 directional cues with a shared Lucide component and used the shared labelled 44px button for gallery, menu and detail close controls. No text arrow glyphs remain in application TSX. Existing destination attributes and actions are preserved; no extra interactive nesting was introduced.
- Production webpack/TypeScript build and 37 Node booking/domain tests pass. The isolated admin HTTP check passed after the component changes. Existing hook/compiler lint findings remain nonzero and are documented in BOOKING-AUDIT.md; no clean-lint or full automated browser claim is made.
- In-app browser checked 1440px desktop and 390px/320px mobile: homepage/card actions, gallery previous/next and keyboard focus, mobile menu Escape/focus return, detail sheet Escape/focus return, editorial card alignment, checkout Back to package and saved tickets. Actual icon-only targets measure 44×44px; decorative card/CTA cues do not add a second target. A broad rule initially affecting photos was narrowed, then the full-width photos were verified.
- The 320px date/traveller dropdown overhang was fixed by stacking those two fields. Final checkout and saved-bookings widths match the 320px viewport. Arrow thickness is 1.75 with 18px SVGs. Primary/secondary card actions share the same height.
- Re-downloaded and inspected family demo ticket JG-771173D012 after the final wrapping fix. Three travellers including one child, ₹31,211 total, ₹99 simulated token, ₹31,112 balance, QR, itinerary, saved arrangements and cancellation terms are readable. No new real payment, supplier reservation or external message occurred.
- Fresh UI screenshots are saved beside the sanitized source ZIP. Local production preview remains at http://127.0.0.1:3001/.

## Traveller package clarity — 3 November 2026

- 43 Node tests pass. Six new cases cover allowance versus inclusion, all catalogue night totals, breakfast-only/dinner-only/no meals and conflicting metadata, mixed stays/room occupancy/children, open sky, partial transfers and vehicle specifications, solo/private compatibility, shared vehicle quote requests, bundled-jeep deduplication and immutable downloaded ticket facts. Existing 37 pricing, capture, duplicate, refund, capacity, privacy and recovery tests remain green.
- TypeScript and production build pass with existing routes intact. The isolated administrator HTTP integration passes with the optional facts schema; no private database reset, live payment or supplier booking was performed. Prior lint/full-browser-runner limitations remain documented separately.
- In-app browser at 1440px inspected six fact highlights and the grouped details panel. At 390px, selected three travellers including one child, single occupancy and a jeep allowance. The same ₹33,367 group estimate carried into checkout and demo ticket JG-46F83E7292: ₹99 simulated token, ₹33,268 balance. Saved clarity shows three private units, one city night, one desert night and one model transfer vehicle. The downloaded PNG was inspected without clipped or overlapping sections.
- Swiss-tent-only package shows one tent night, own arrival, proposed breakfast/dinner and camel activity; lunch, snacks, water and dietary choices remain Not specified. These are named proposals in the existing data, not invented supplier inclusions. The food accordion and selected quote remain readable at 390px and 320px.
- Final narrow checks: page width matches 320px for the package page, details sheet and saved ticket; the details sheet remains within its viewport and the primary booking action stays visible. The modal header reduces duplicate destination imagery and marketing copy; full imagery and description remain on the standalone package page.
- Fresh package-card/detail screenshots and sanitized source ZIP accompany this pass. Actual property names/photos, amenities, vehicle assignments, menus and times still require supplier data. New operator fields and compatibility boundaries are described in PACKAGE-CLARITY.md.

- Final HTTP-only published-route/internal-link check also passed after the information changes, including the unknown-route 404. This uses request fixtures, not a Chromium accessibility run. Final 390px modal capture confirms a 390px sheet and no horizontal page overflow.


## Conversion analytics verification — 3 November 2026

- All 48 domain, booking and analytics tests pass using Node 20.20.2. The test runner uses Node --import tsx to avoid an unnecessary IPC listener.
- Optimized Next.js production build and TypeScript checks pass. No dependency changes.
- Isolated authenticated HTTP integration passes: admin session, CSRF, catalogue/departures, idempotent demo captures, offline balance, refund ledger, analytics auth, PII/financial-event rejection, deduplicated ingestion, completion safeguards, actual contribution and withdrawal. Tests use temporary databases and fictitious details, never production payments or user credentials.
- Browser QA: opt-in → package → essential name/mobile form → demo payment → instant QR ticket; exactly one verified reservation in Demo and zero in Live. Consent withdrawal removes anonymous usage attribution and preserves payment totals.
- Responsive checks: dashboard at 1440px and 390px; narrow mobile review identified and fixed admin tab/footer overflow. Final homepage at 320px has document width 320px. The preview is running on port 3001.
- Screenshots: outputs/jaisalgo-analytics-desktop.png and outputs/jaisalgo-analytics-mobile.png (outside the source archive).
- Limits: traffic covers consenting anonymous sessions, no historical baseline is invented, no test has measured real conversion lift, and geography / true customer CAC / accounting recognition require actual business data. No A/B experiment is active; targets are goals.
