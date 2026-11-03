# JaisalGo redesign audit and decisions
25 October 2026. Scope: refine the existing local Next.js application; preserve routes, metadata, data, filters and enquiry integration.

## Audit before edits
Inspected package configuration, existing homepage, navigation, cards, photo component, typed models, all 14 package records, six licensed image records, filters and planner, server API and reusable route templates. Browser audit at 1440, 768 and 390px showed no horizontal overflow.

Highest-impact issues:
1. Georgia/Arial lacks the requested distinctive typographic personality; navigation and supporting text are often undersized.
2. The old hero is mostly grey sky and its mobile heading occupies five lines. The fort needs a more intentional crop and shorter headline.
3. Homepage repeatedly uses three-column cards and similar serif headings. Travel styles are text links rather than an intent-led discovery tool.
4. Package cards repeat generic inclusion copy and regional sunset imagery rather than making differences useful.
5. No motion system or scroll-aware header exists; only image hover scale. The global smooth scroll respects reduced motion but section rhythm is static.
6. All prices are unconfirmed (null / enquiry), accommodation is a preference, and no property or activity availability is established. Preserve these facts; no luxury property, included dinner, family-safety or shared-group guarantee can be introduced.
7. Working foundations to retain: all URL routes, canonical/OG metadata, sitemap/robots, article/breadcrumb schema, filters and sorting, quick planner, field/server validation, honeypot and rate limits, local brief download, optional webhook and verified-contact configuration.

## Design direction
Choose **A Golden State of Mind**: warm ivory and white, quiet charcoal UI, sandstone accents, terracotta links and a limited indigo desert chapter. Use self-hosted Cormorant Garamond + Manrope rather than Playfair + DM Sans: the finer display forms complement the existing sun wordmark and create greater contrast with functional UI. Use limited variable weight ranges, next/font/local and bundled SIL OFL licenses.

Hero concepts considered: old blue-hour fort (recognizable but low contrast/soft), sunlit fort panorama (strong architectural subject), Khuri landscape (open landscape, tiny travelers, strong feeling). Choose after inspecting licensed downloads at desktop/mobile crops. No generated accommodation or stock travelers implied to be customers.

Homepage: cinematic opening → short editorial introduction + retained quick planner → nine traveler-intent collections with live recommendations → natural horizontal photo gallery → varied place editorial → indigo desert chapter → itinerary/planning hub → transparent service context/FAQ → final invitation. Avoid pinned or hijacked scrolling.

## Interaction architecture
A compact IntersectionObserver layer animates selected section headings/images using transform/opacity; content remains visible without JavaScript. Hero entrance is immediate and brief. Reduced-motion preference disables reveals, image scale and smooth scrolling. Header transitions from transparent to solid using a passive scroll observer; mobile menu remains keyboard and Escape accessible. Gallery uses native overflow + scroll snap with accessible previous/next controls and touch swipe.

Collections are data mappings to existing packages, not invented products. Couples, friends (all genders), family, dunes, heritage, premium preferences, solo, short stays and private custom planning all route into the existing discovery filters. Cards show data-specific proposed highlights and accommodation preference with explicit quote status. No new booking backend or contact identity is assumed.

## Verification plan
Typecheck, lint, domain regression tests, production build, HTTP route/link/API tests; real browser checks at 1440,1280,768,390,360px, reduced-motion, menu keyboard handling, collection filters, gallery, forms and image loading. Record actual outcomes and environment limits below when complete.

## Implemented outcome
Selected Khuri camel-and-dune photograph after inspecting the original: people on the horizon and open sand allow a short headline without hiding the subject. Warm fort panorama and a real Jaisalmer street image supplement the retained assets. Added data fields for focus, mobile focus and intended placement. Each trip now has specific proposed highlights and a stay label; unknown prices remain unchanged. Family trip copy describes a planning preference rather than asserting verified camp facilities.

New source records (accessed 25 October 2026):
- https://commons.wikimedia.org/wiki/File:Thar_Khuri.jpg — file-history uploader Flicka~commonswiki; CC BY-SA 3.0; original 2878×1923. Current summary lacks machine-readable author; preserved uploader/file-history attribution rather than inventing an identity. Historical destination image, not a current supplier photo.
- https://commons.wikimedia.org/wiki/File:Fort_Jaisalmer_at_sunset.jpg — Const.crist; CC BY-SA 3.0; 2560×1920.
- https://commons.wikimedia.org/wiki/File:Street_in_Jaisalmer.jpg — Clément Bardot; CC BY-SA 4.0; 3728×4273.
- Google Fonts Cormorant Garamond and Manrope source repositories (SIL OFL 1.1); licenses included in public/fonts. Latin glyph subset converted locally to variable WOFF2: normal display ~80 KB, italic ~58 KB, body ~29 KB. next/font/local handles preloads and fallback metrics.

The additional dune image candidate by Timothy A. Gonsalves was not published; retained existing documentary alternatives. Current verified room, jeep, folk-performance, food and traveler-group photography was not supplied. Correctly identified destination imagery is used instead, with property/experience confirmation notes. No stock people are presented as customers.

The redesign preserves all routes, structured content, metadata, package filtering, sort URLs, form validation, API handler and download fallback. The filter component now derives state directly from Next’s search parameters so collection link navigation and browser history stay consistent. No dependency was added to the application.

## Final checks performed
- Strict TypeScript, ESLint and six domain tests passed; production webpack build passed.
- Two HTTP Playwright checks passed on the production preview: all published routes/internal targets (including the nine image records) and API origin/validation/honeypot/oversize/unconfigured/rate-limit states.
- In-app browser inspection completed at 1440, 1280, 768, 390 and 360px. Document width matched viewport at all checked homepage sizes. Package discovery, family details and planner also showed no horizontal overflow at narrow mobile; guide listing showed none at tablet size.
- Selected Friends, then used Right Arrow to move to Family; matching headings, existing trip links and selected states updated. Selected the final private collection on narrow mobile and followed its URL filter.
- Gallery next control advanced the native horizontal rail. Page document remained vertically scrolling, with no horizontal page overflow.
- Mobile menu opened, Escape closed it and updated aria-expanded. Transparent header became solid on scroll. Shared font families were loaded and inspected.
- Filtered private trips by one day (two matches), searched to an empty state, cleared to all 14, and sorted longest first. Query parameters tracked the selection. Existing quick planner contract remains unchanged.
- Family package preselected correctly in its form. Fixed the inherited generic 3-day form default: package briefs now initialize to their own duration (family 4 days).
- Empty submission focused the required name field. Fictitious test details produced a personalized brief and an actual downloadable text file. UI explicitly said no enquiry had been sent. Browser console error log was empty on that journey.
- Checked compiled reduced-motion media rules disable animation/transitions, restore reveal visibility and remove gallery snapping. The browser’s actual OS preference was false; a live preference-toggle test was not performed.

Automated axe and full browser-runner checks were not rerun: the prior sandbox Chrome runner aborted at launch. The actual browser interactions above used the in-app browser. No Lighthouse, field Core Web Vitals or full WCAG conformance score is claimed. No live supplier availability or webhook delivery was invented or tested.

Preview recovery: dev mode initially hit the host open-file watcher limit. Polling was enabled for future `npm run dev`; verification used a successful production build on port 3001. The older process on port 3000 was not editable/stoppable from this sandbox, so it was not reused as the redesigned preview.
