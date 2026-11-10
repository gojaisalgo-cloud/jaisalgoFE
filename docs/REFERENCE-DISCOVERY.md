# MakeMyTrip reference audit and implementation mapping

Reviewed: 9 November 2026. All nine supplied screenshots were inspected individually.

## Target application check

The supplied request names **LiftNGo**. The attached workspace and running application are **JaisalGo**, a Jaisalmer package and booking application. The workspace search found one application (`outputs/jaisalgo`) and no LiftNGo project or references. The user confirmed applying the changes to JaisalGo. This document records the complete reference audit independently of that decision.

Screenshots establish visible presentation and controls, not whether MakeMyTrip's underlying actions work. Described flows below are proposed adaptations where a control implies an interaction. Safari's status bar, clock, date, domain pill, connection indicator and battery indicator are browser/device chrome, not application features to recreate. Red circles/arrows and blue outlines are annotations, not product UI.

## Screenshot 1 — 8.01.49 PM

- Full-width dark navy exploration/navigation strip, with generous horizontal spacing and white uppercase labels.
- Five visible category triggers: Last Minute Deals, Honeymoon, Offer Zone, Group Tour Packages and Pilgrimage.
- Each trigger has a downward chevron suggesting expandable content. The contents of those menus are not shown.
- Right-aligned `Close Explore` action and a partially cropped circular close control at the far edge.
- A second exploration layer is implied by the close action; its opening trigger is not visible.
- Adaptable pattern: a dismissible exploration panel with genuine, supported categories. Promotional urgency, religious categories and offers require corresponding real inventory; they cannot be inferred from a screenshot.

## Screenshot 2 — 8.01.56 PM

- White primary header beneath a thin dark top rule; MakeMyTrip logo is partially cropped at the left.
- Icon-over-label product navigation: Flights, Hotels, Homestays (truncated), Holiday packages (truncated), Trains, Buses, Cabs, Visa, Forex Card (truncated), Travel Insurance (truncated), and More.
- Holiday packages is the active product, indicated by blue text/accent while inactive products are neutral.
- More has an ellipsis icon and downward chevron, suggesting overflow navigation.
- Right-aligned circular account avatar/icon with `Login or Create Account` copy, partly cropped.
- Adaptable pattern: recognizable icons, clear active navigation and overflow for existing modules. No extra business verticals or mandatory account creation should be introduced without a product requirement.

## Screenshot 3 — 8.02.04 PM (1)

- Desktop/tablet two-column results surface with a white filter sidebar, vertical divider and results area on a light neutral canvas.
- Large rounded upper-left corner; separate sidebar `FILTERS` header and results category header.
- Horizontal result tabs: active `ALL PACKAGES (178)` with blue underline, left chevron, and a partially visible Golden Triangle tab.
- Hotel Category accordion expanded, with upward chevron and four rounded outlined tiles: `<3★ (0)` visibly muted, `3★ (105)`, `4★ (73)` and `5★ (58)`.
- Cities accordion expanded, with search input and trailing search icon, checkbox rows for Udaipur (86), Jaipur (71), Jodhpur (51), Jaisalmer (32), right-aligned counts and `Show More` link.
- Buy Now, Pay Later accordion collapsed, with downward chevron.
- Themes accordion expanded with visible Culture (115), Adventure (62), and partly cropped Offbeat (14) checkbox rows.
- Results card has destination photograph, bold `Memorable Jaipur Holiday` title, `2N Jaipur` stay summary and separator.
- Two-column bullet summary: 3 Star Hotel, 3 Activities, Airport Pickup… and Selected Meals.
- Teal checkmarked highlights: Elephant Ride, MMT Tour Manager Assistance and a multi-attraction sightseeing line, clipped at the right.
- Bottom inset light-gray price/value panel with seasonal-average comparison copy and partly cropped bold price/total caption.
- Adaptable pattern: searchable facets with counts, explicit disabled zero-count options, amenity summaries and a distinct price region. Star ratings, tour-manager service, inclusions and seasonal savings need verified source data.

## Screenshot 4 — 8.02.04 PM

- Same exploration strip, rounded split layout, sidebar header and active counted All Packages tab.
- Nine individually collapsed filter groups, each separated by a thin rule and ending in a downward chevron: Duration (in Nights), Flights, Budget (per person), Hotel Category, Cities, Buy Now, Pay Later, Themes, Package Type, Premium Packages.
- Results card: large rounded image of a lake/boat; bold `Magical Udaipur Vacation` title (cropped), `3N Udaipur` summary, divider and bullet summary including 3 Star Hotel and 3 Activities.
- Teal checkmarked highlights include Photoshoot, a Fateh Sagar Lake/Sajjangarh sightseeing line and Saheliyon Ki Bari/Museum of Folks Art line; text continues beyond the crop.
- Inset card footer reads `Specially Curated For You`. A second result card is partially visible below.
- Adaptable pattern: progressive disclosure reduces filter density; descriptive card highlights support scanning. A static curation claim is not evidence of personalization.

## Screenshot 5 — 8.02.05 PM (1)

- Wider view shows the dark exploration strip, Close Explore text/circular X and two-column card grid beside the filter sidebar.
- Counted horizontal tabs: All Packages (178), Golden Triangle (38), Wildlife Special (1), Group Tours (1), a truncated Heritage label and previous/next chevrons. Active tab uses a thick underline.
- Pay-later filter expanded: unchecked `Book @ ₹2,000 (59)`.
- Themes expanded: Culture (115), Adventure (62), Offbeat (14), Honeymoon (5), plus Show More.
- Package Type expanded: outlined Customizable (176) and Group Package (8) selection tiles.
- Premium Packages expanded: checkbox `Premium packages (26)`.
- Selected card is darkened behind an option-selection panel. Its photograph, `Magical Udaipur Vacation`, `3N Udaipur`, compact `3N/4D` badge and summary remain visible behind the panel.
- Panel heading repeats package title, includes a circular X close action and `Please select an option` instruction.
- Two full-width selectable option rows, with elevation/border and right-pointing chevron:
  - Starting from Udaipur; Without Flight; ₹31,104 per person; a small struck-through original price.
  - Starting from New Delhi; With Flight; ₹60,178 per person; a small struck-through original price.
- `2 More Options Available` blue outlined pill attached above/near a card, implying a variant-picker entry point. Its exact trigger behavior is not proven by the static image.
- Adjacent card: `Dreamy Jaisalmer, Jodhpur & Udaipur…`; `2N Udaipur • 1N Jodhpur • 2N Jaisalmer` route/stay split; Intercity Car Transfers, 3 Star Hotels, Airport Pickup & Drop, 9 Activities, Selected Meals; Photoshoot, Boat Ride, Camel Ride.
- Adjacent price footer: ₹32,595 /Person, Total Price ₹65,190, seasonal-average comparison claim. A separate offer row reads `Extra ₹1,234 off. Use Code HDFCEMI` with a discount icon.
- Right-edge persistent assistance rail: Live Chat and Get a callback.
- Adaptable pattern: explicit package variants and origin/arrangement/price comparison before continuing. Do not create flight, coupon, chat, callback or financing functionality without its actual integration and eligibility rules.

## Screenshot 6 — 8.02.05 PM

- Close-up of a vertically stacked fixed-style assistance rail on a pale warm background, with rounded corners and a soft shadow.
- Coral circular chat icon above bold `Live Chat`; separator rule; coral phone icon above two-line `Get a callback` label.
- Each item has a large combined icon-and-text target; the edge placement keeps help beside browsing content.
- No chat window, response time, callback form, consent, success state or availability indicator is shown.
- Adaptable pattern: an accessible help launcher connected to existing support channels, positioned without covering cards or mobile checkout controls. Do not label a phone link as live chat or a completed callback request.

## Screenshot 7 — 8.02.06 PM (1)

- Same category strip, counted tabs, expanded pay-later/themes/type/premium facets and right-edge assistance rail.
- Two result cards per row, on a light neutral background with gutters and rounded image/card edges.
- `2 More Options Available` pill is shown above both visible cards.
- Left card: night photograph of Hawa Mahal; `Memorable Jaipur Holiday`; `2N Jaipur`; compact `2N/3D` badge aligned right; divider.
- Two-column summary: 3 Star Hotel, 3 Activities, Airport Pickup & Drop, Selected Meals.
- Teal checked highlights: Elephant Ride, MMT Tour Manager Assistance, and Visit to Amer Fort, Hawa Mahal, City Palace Jaipur.
- Gray price footer: seasonal-average comparison text; ₹12,277 /Person and Total Price ₹24,554, with hierarchy distinguishing unit and group price.
- Right card: lake landscape, `Enchanting Udaipur Trip`, `2N Udaipur`, 3 Star Hotel, 2 Activities, Airport Pickup & Drop, Selected Meals; Boat Ride, Saheliyon ki Bari/Jagdish Temple/Vintage Car Museum, City Palace.
- Right price footer: `No Cost EMI at ₹2,981/month`, ₹11,977 /Person, Total Price ₹23,954; overlapping mint pill `Book this package @ ₹2,000`.
- An offer-code row from an earlier card is partly visible above; it is not a new separate screen feature.
- Adaptable pattern: paired inclusion summaries, specific highlights, compact duration, variant discovery and transparent per-unit/group totals. EMI and price-comparison claims require real financial/product data; do not copy them as decoration.

## Screenshot 8 — 8.02.06 PM

- Expanded Duration (in Nights) accordion: dual-ended blue range track, circular white thumbs/shadows, endpoint labels 1N and 10N.
- Expanded Flights accordion: outlined `With Flight (145)` and `Without Flight (184)` tiles.
- Expanded Budget (per person) accordion: dual-ended range track, ₹0 and ₹10,75,000 endpoints.
- Four unchecked budget bands with right-aligned result counts: <₹15,000 (56), ₹15,000–₹25,000 (68), ₹25,000–₹45,000 (84), >₹45,000 (57).
- Expanded Hotel Category begins below: partly cropped `<3★`, `3★`, `4★`, `5★` tiles.
- Each group has bold label, upward chevron, ample whitespace and horizontal separator.
- Adaptable pattern: bounded numeric filters plus convenient presets; preserve readable values and keyboard-accessible controls. Counts may overlap across facets and should be calculated from the target application's own data. The screenshot's budget limits are not business requirements for another app.

## Screenshot 9 — 8.02.07 PM

- Another crop confirms the same filter hierarchy: preceding Show More action, expanded Buy Now/Pay Later, Themes, Package Type and Premium Packages.
- All Packages (178) active tab and previous chevron remain aligned above results.
- Pay-later checkbox and ₹2,000 threshold/count; four theme checkboxes/counts plus Show More; two type tiles/counts; premium checkbox/count.
- Result card repeats image, title, nights/location, summary, checkmarked highlights and price/value footer; next desert card visible below.
- This screenshot provides a closer legibility check for the facets; it does not reveal an additional independent flow.

## Cross-screenshot interaction and layout inventory

1. Primary product navigation → selected product → optional More overflow; separate contextual exploration strip with dropdown triggers and dismiss action.
2. Browse results → choose a counted collection tab → narrow using accordions, checkboxes, segmented tiles, range controls and searchable lists → inspect image, duration, route, inclusions and price.
3. Where more choices exist: discover option badge → open variant panel → compare arrangement/origin/unit prices → select a variant → continue. Panel close returns to browsing. Only the open picker and selectable rows are evidenced, not the next page.
4. Persistent assistance entry → chat/callback. The reference does not show either downstream flow.
5. Independent per-person/group prices, advance-payment badge, optional struck-through comparison price, offer code and EMI copy have distinct information roles; none should be conflated with taxes, verified final totals or booking confirmation.
6. Visible component vocabulary: headers, icon navigation, dropdown triggers, active/overflow tabs, accordion rows, checkboxes, counts, search input, range sliders, segmented tiles, zero-result disabled tile, show-more link, image cards, compact duration chips, itinerary/night splits, separators, bullet/check lists, price footers, offer rows, variant badges, close buttons, directional controls and assistance rail.
7. Header/tab alignment is consistent across scroll-position screenshots, suggesting persistent controls; sticky behavior cannot be conclusively tested from these images. The supplied tablet crops show horizontal clipping, which should not be copied into a responsive implementation.
8. No screenshot shows a booking form, date picker, traveller selector, payment processor, ticket, authentication form, chat transcript or callback confirmation. Existing flows for those screens should be preserved, not replaced by invented reference behavior.

## Feature mapping to the JaisalGo codebase inspected

The user confirmed JaisalGo as the intended target; this mapping was used for implementation. LiftNGo's modules and business model cannot be mapped accurately without its codebase.

| Reference idea | Existing JaisalGo location | Current behavior and relevant gap |
| --- | --- | --- |
| Product navigation, active state, overflow, close | `components/navigation.tsx` | Existing packages/experiences/guide/My bookings routes, active links, responsive menu, Escape/outside close. Reuse these; do not add unsupported flight/hotel/visa verticals or account requirements. |
| Counted collection tabs and arrows | `components/booking/catalog.tsx`, `components/directional-control.tsx` | Existing type/for-two category buttons; no result counts. Adapt using real catalogue counts and existing 44px icon buttons; preserve current query links. |
| Collapsible filter sidebar/mobile sheet | `components/booking/catalog.tsx` | Search, exact duration, budget-category and sorting are existing controls. Add progressive disclosure and a mobile filter presentation only after target confirmation; preserve homepage compact rendering. |
| Numeric nights/budget bands | `lib/booking/pricing.ts`, `components/booking/catalog.tsx` | Existing integer-paise quote function and default choices provide a consistent comparison basis. New filters must label the basis, honor each package's person/tent/vehicle unit, and never treat ₹99 as the package price. |
| Searchable locations/themes/types/counts | `lib/booking/package-details.ts`, `data/travel-options.ts`, `data/catalog.ts` | Actual kind, area, attractions, styles and stay types exist. Compute counts from that data; avoid invented hotel star ratings, verified availability or supplied inclusions. |
| Hotel category / premium facet | `data/catalog.ts`, `types/marketplace.ts` | Budget/Comfort/Premium are allowance categories, not star ratings. Actual stay type may be unspecified; unknown values must stay explicit. |
| Transport variants | `components/booking/trip-preferences.tsx`, `lib/booking/preferences.ts` | Existing transfer checkbox/private/shared/solo and pending-request logic. No flights. Preserve requests that require a supplier quote; do not promise unpriced shared inventory. |
| Informative cards and route summaries | `components/booking/tour-card.tsx`, `components/booking/package-clarity.tsx` | Cards already have six highlights, duration, information dialog, price basis, ₹99 note and Book now. Group estimate visibility and variant discoverability can improve without duplicating inclusion promises. |
| Variant picker and handoff | `components/booking/package-information.tsx`, `components/booking/trip-preferences.tsx`, `lib/booking/preferences.ts` | Existing accessible native-dialog details, choices, live recalculation and bookingHref propagation. Reuse rather than create a second competing quote engine. Verify query round-trip and return focus. |
| Advance payment and total | `components/booking/payment-choice.tsx`, `components/booking/reservation-form.tsx`, `lib/booking/pricing.ts` | ₹99 is deducted from full total; balance at arrival; full-payment option already exists. No EMI/coupon/discount programme is integrated. Preserve all payment/supplier/inventory gates. |
| Persistent support | `components/booking/booking-assistance.tsx`, `lib/config.ts`, `components/enquiry-form.tsx`, `app/api/enquiries/route.ts` | Confirmed phone 8824548099. WhatsApp is optional configuration; enquiry delivery requires a configured webhook. A help panel can expose real links; no live-agent or callback-success claim without an active service. |
| Reference styling | `app/polish.css`, `app/marketplace.css`, `app/controls.css`, `components/dropdown.tsx` | Retain Manrope/Cormorant, current brand colors, shared dropdowns, buttons, focus and motion conventions. Do not import MakeMyTrip branding, navy/coral/blue palette or screenshots as app assets. |

## Implementation acceptance checks

- Every visible reference feature has an explicit implemented, already-present, unsupported/data-dependent or non-product-chrome disposition; no unexplained omissions.
- Facet counts derive from real records, filtering combinations have documented AND/OR rules, boundaries are inclusive as labelled, disabled controls are truthful, and zero-results have a working reset.
- Browser Back/Forward and refresh preserve the chosen filters; unrelated existing query parameters/routes keep working. Clear/reset removes only discovery filters, not private booking state.
- Variant choice updates price through the existing calculator and carries the same choices into checkout. No per-unit/per-person/group mismatch or invented discount.
- Accordions, menus, sheets and pickers work by keyboard; focus stays visible, dialogs trap/restore focus, Escape closes, selected states are announced, and touch targets remain at least 44px.
- Mobile filters and persistent help do not cover checkout actions, tickets or essential content; test 320px, phone, tablet and desktop widths, long labels and empty results.
- Help destinations are real; unavailable chat/callback integrations never produce fake success. No email requirement, extra mandatory account or automatic outbound message is introduced.
- Existing date/traveller selection, pricing, payment verification, inventory, ticket access, privacy and admin behavior remain intact. Real-payment readiness remains a separate configuration/business approval requirement.
- Run focused filter/variant regression tests, typecheck and production build; browser-check changed navigation, filter, details-to-checkout and support paths. Report pre-existing checks separately from regressions.

## Work completed in this pass

- Audited every supplied screenshot and separated visible evidence, annotations, device chrome and inferred interactions.
- Located and inspected the existing JaisalGo navigation, catalogue, card, detail-dialog, pricing/preference, support and enquiry modules.
- Identified the target-app mismatch before editing application source.
- Created this audit artifact before implementation, then implemented the relevant patterns in JaisalGo after target confirmation. See the implementation and verification record below.


## Implemented in JaisalGo after target confirmation

- Counted, horizontally scrollable package collections with selected states and disabled zero-match categories. Previous/next controls use the existing icon-button component and respect reduced motion.
- Desktop filter sidebar and native mobile filter dialog with live counts. Exact trip days, inclusive night range including day-only trips, normalized per-person estimate range, non-overlapping budget presets, Budget/Comfort/Premium allowance tiles, searchable route places with show-more, traveller/theme selections, actual base stay type including unknown, transfer default and package arrangement.
- OR within a facet and AND across facets. Counts omit their own facet while respecting all others. Disabled zero-count checkboxes remain removable if already selected.
- Search, six sorting choices, removable filter chips, reset, empty-result recovery and custom-planning escape route. Discrete choices support Back/Forward; refresh preserves filters. Reset preserves attribution and unrelated trip parameters.
- Existing cards retain their six inclusion highlights and duration badge, and now show a visual city/desert night split, clearly labelled rounded per-person estimate where applicable, exact default-group estimate, and a Compare options action.
- Compare options opens the existing details dialog directly at Price & extras, with the decorative hero removed in this focused view so phone users reach the choices immediately. Existing traveller, occupancy, stay, transfer and activity controls recalculate through the original quote engine and propagate into the unchanged checkout URL.
- Icon-led primary navigation and a closable Explore dialog link only to supported collections. Mobile Explore restores focus without closing the underlying navigation unexpectedly.
- Responsive assistance launcher opens a real call link, custom-trip brief and saved tickets. WhatsApp appears only when separately configured. Transaction/admin/verification screens retain inline help and do not receive the floating launcher.
- The contact page now uses the supplied phone number instead of the outdated statement that no phone was supplied.
- Retry QR clears stale error feedback. Ticket/payment/inventory rules and integrations are unchanged.
- All new filter URLs participate in the existing filtered-page noindex/canonical policy.

### Reference disposition

| Screenshot | Disposition |
| --- | --- |
| 1 | Contextual collection exploration and close action implemented in Explore; unverified deals/offers/pilgrimage menus omitted. |
| 2 | Icons and active navigation retained/adapted; Explore provides supported overflow. Unrelated verticals and login requirement omitted. |
| 3 | Counted accordion facets, searchable places, disabled zero-count options and card price hierarchy implemented. Existing inclusion/detail components retained. Hotel stars and seasonal savings not fabricated. |
| 4 | Collapsible filter hierarchy implemented for real catalogue dimensions; existing detailed package content remains the disclosure layer. No invented personalization. |
| 5 | Comparison action opens existing real pricing/options controls; chosen arrangements and totals flow to checkout. No flight prices, discount codes or fake option counts. |
| 6 | Persistent assistance adapted to configured support channels with real destinations. No unsupported live chat or callback promise. |
| 7 | Unit/group estimates and stay allocation added to cards; information, inclusion statuses and Book now retained. Financing/savings/advance amount adapted to the existing ₹99 policy without inventing EMI. |
| 8 | Keyboard-operable min/max night and budget inputs, budget bands and counted allowance tiles implemented. Flights map to actual transfer/arrangement facets; hotel stars are not inferred. |
| 9 | Themes, package arrangement, premium allowance and show-more patterns implemented without duplicate controls. Existing details, booking and payment flows reused. |

### Modified application files

- `app/discovery.css`: isolated discovery, card additions, modal, navigation and assistance styling.
- `app/layout.tsx`: shared styles and configured assistance launcher.
- `app/[...path]/page.tsx`: current contact copy and working phone link.
- `components/navigation.tsx`: icons, Explore entry and modal-aware Escape handling.
- `components/discovery-assistance.tsx`: collection exploration and truthful assistance destinations.
- `components/ui/modal.tsx`: shared native dialog with scroll locking, Escape/backdrop dismissal and focus restoration.
- `components/booking/catalog.tsx`: URL-backed discovery layout, counted collections, toolbar, chips and empty state.
- `components/booking/catalog-filters.tsx`: responsive real-data facets and bounded controls.
- `components/booking/tour-card.tsx`: night split, rounded-unit clarification, group estimate and comparison entry.
- `components/booking/package-information.tsx`: additive options entry to the existing pricing panel.
- `components/booking/digital-ticket.tsx`: clear stale QR error when retrying.
- `lib/booking/catalog-discovery.ts`: reusable immutable filter, facet, count, sort and URL helpers.
- `lib/seo.ts`: new filters inherit noindex handling.
- `.gitignore` and `eslint.config.mjs`: exclude all custom Next.js build outputs from source control and source lint.
- `scripts/run.mjs`: include discovery regression tests in the existing test command.
- `tests/catalog-discovery.test.ts`: seven price/facet/boundary/link/handoff regressions.
- `tests/seo.test.ts`: noindex assertions for new filter parameters.
- `docs/REFERENCE-DISCOVERY.md`: this audit, mapping and implementation record.

Next.js also regenerates local type paths in next-env.d.ts and tsconfig.json when running isolated builds. These generated paths are not product changes.


## Final verification — 9–10 November 2026

- Automated suite: **90 passing tests**, including seven discovery regressions and existing payment verification, duplicate payment, capacity, privacy, cancellation/refund, PDF/QR, analytics and SEO tests. No real payment was made.
- Typecheck and production build passed. The isolated production build generated 71 static pages and all existing dynamic booking routes.
- Focused source lint for the new catalogue, filters, modal, assistance, card, option panel, helpers and tests passed. Repository-wide source lint retains the existing **11 errors and 8 warnings**; this is not a clean repository lint claim.
- Browser checks: counted categories, Premium facet/zero-count disabling, Back restoration, refresh persistence, searchable route filtering, removable chips, keyboard night ranges, tablet duration dropdown, empty-result reset, modal focus containment and Escape restoration.
- Responsive checks at **320, 390, 768, 1024 and 1365 pixels** found no document or card-content horizontal overflow. Phone uses one card column; tablet/desktop use two; desktop has a sidebar and smaller screens use a filter dialog. Viewport overrides were reset.
- Real browser **local demo** journey: compare five travellers with single occupancy and own arrival → unchanged checkout → simulated ₹99 payment → ticket. Full group total **₹43,431** and balance **₹43,332** matched across options, checkout and ticket.
- A ticket PDF downloaded successfully (19,241 bytes, valid PDF header). The saved booking **JG-21783A8452** reopened from My Bookings after server restart, displayed its QR and had no stale error message. This proves the local demo flow only.
- Phone assistance points to **tel:+918824548099**. No actual call, WhatsApp message, callback, live chat or live payment was initiated. The floating help launcher is absent on transactional screens.
- HTTP checks returned 200 for homepage, packages, filtered packages, contact, planning and My Bookings. Filtered package URLs retain the packages canonical and return noindex; private booking pages retain their noindex policy.
- The code is running locally at **http://127.0.0.1:3001/packages**. GitHub publishing was checked and is blocked by missing Git credentials on this Mac. The dry run did not change the remote repository.
- Real production booking still needs the previously documented hosted database, live payment setup and supplier/date approval. None of those gates was bypassed by these UI changes.

### Verification artifacts

Artifacts are in the parent outputs folder: `jaisalgo-discovery-desktop.png`, `jaisalgo-discovery-card-pricing.png`, `jaisalgo-discovery-mobile-filters.png`, `jaisalgo-discovery-mobile-options.png`, `jaisalgo-discovery-responsive.json`, `jaisalgo-discovery-http.json` and the final source ZIP. Browser-test booking access keys and database files are excluded from delivery.
