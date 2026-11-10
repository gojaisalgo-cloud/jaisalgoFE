# JaisalGo SEO release — 10 November 2026

This release supersedes historical implementation counts and configuration statements in the 3 November audit. It extends the existing app; prices, ₹99 reservation tokens, payment verification, supplier conditions and private ticket access are preserved.

## Scope delivered

- Homepage: explicit Jaisalmer tourism H1, destination introduction, attraction discovery, season and itinerary guidance, planning links, audience comparisons and visible booking FAQs.
- Seven distinct commercial collections: family, honeymoon, budget, solo, group, premium and two-night/three-day packages. They filter real published inventory. Premium allowance models do not imply contracted luxury hotels.
- Five new informational pages: desert safari, camel safari, jeep safari, local transport and international visitors. Existing attraction, camping, season, budget and itinerary articles have additional practical guidance and contextual links.
- Four additional researched origin guides: Mumbai, Hyderabad, Chennai and Kolkata. All ten requested origin cities are covered. Origin tickets remain separate from local package estimates.
- Thirteen 301 aliases preserve established canonical URLs instead of publishing duplicate synonym pages. Exact targets are in [SEO-REDIRECTS.csv](SEO-REDIRECTS.csv).
- Unique metadata, canonical English language alternatives, breadcrumbs, social cards and truthful Organization, WebSite, TouristDestination, Article, ItemList and TouristTrip graphs. No fabricated reviews, fixed supplier offers or FAQ rich-result claims.
- Canonical sitemap, query noindex rules, private route headers and correct 404s remain in place. Hindi architecture uses an English fallback; no untranslated Hindi copies or hreflang claims are published.
- Responsive local images retain descriptive ALT text, licences and dimensions. AVIF/WebP negotiation is enabled. Package information dialog code is loaded on demand; the standalone detail page still renders full itinerary content on the server.
- Optional consent-based GA4 public-page adapter, private-route exclusions and sanitized URLs. The command queue now uses Google's documented Arguments protocol. No booking/customer/payment payloads are sent to GA4.

## Keyword and route inventory

[SEO-PAGE-MAP.csv](SEO-PAGE-MAP.csv) assigns one primary intent to each of 89 canonical pages. It covers 11 static public hubs/utilities, 24 specific products, seven commercial comparison collections, 37 editorial articles and ten origin guides. It contains proposed editorial targets, not measured search volumes or ranks.

The homepage owns destination discovery; `/packages` owns general commercial comparison. Audience collections compare multiple products, individual products describe a specific itinerary, duration collections compare priced stays, and itinerary guides explain sightseeing sequences. Safari explainers and bookable activity models retain different informational/commercial purposes.

Refresh the seed-catalogue inventory with `node --import tsx scripts/seo-keyword-map.ts`. After live catalogue edits, compare the export with the actual deployed sitemap; production publication state remains authoritative.

## Validation and measured limits

- Production release `45e3cfe`: full deployed HTTP audit passed — 89 pages, 89 sitemap entries, 132 internal targets, 18 image assets and zero critical issues.
- Semantic audit of all 89 local pages found no skipped heading levels. The audit now also verifies heading order, English language alternatives and same-page anchor targets.
- The follow-up optimized production build and all 104 automated tests passed. Targeted ESLint for the changed analytics, map generator and SEO test modules passed.
- Browser checks covered home, family collection, safari guide, international guide, Chennai origin and checkout at 360, 390, 768, 1024 and 1440 pixel widths without horizontal overflow. Package dialog tabs/Escape and a demo reservation completed. No real payment was made during these checks.
- Initial homepage script payload decreased from 958,786 to 900,288 uncompressed bytes in the compared builds, approximately 6.1%; this is not an LCP/INP/CLS measurement. SSR HTML increased with useful destination content.
- PageSpeed API returned HTTP 429. No Lighthouse score, CrUX field pass, indexing, ranking or rich-result eligibility is claimed.

## Google account setup

Search Console verification is being configured for the operator-selected `gojaisalgo@gmail.com`, using the genuine URL-prefix verification token stored in Vercel Production rather than in source control. The sitemap must show a submitted state in that account before this is called complete.

That Google account currently has no Analytics account. The adapter remains disabled until the operator authorizes account creation/terms, a web stream exists, and automatic/Enhanced Measurement is disabled. Public-page analytics require visitor opt-in; checkout, ticket and customer screens remain excluded.

## Files changed

- Content and intent: `data/seo-editorial.ts`, `data/additional-city-guides.ts`, `data/package-collections.ts`, `data/seo-titles.ts`, `data/search-pages.ts`, supporting key allowlists and existing editorial/city models.
- Rendering: homepage, package listing/detail, catch-all editorial and city-origin routes; homepage guide and package collection components; deferred package information content.
- Technical SEO: `lib/seo.ts`, sitemap, Next configuration, analytics path inventory and optional GA4 adapter/provider.
- Verification and operations: `scripts/seo-audit.py`, `scripts/seo-keyword-map.ts`, SEO tests, keyword/redirect CSVs, README and this dated report.

## Source and reference boundaries

Destination facts use Rajasthan Tourism and Incredible India, with official rail, airline, district/airport and visa sources where relevant to each guide. Current schedules, fares and eligibility are left for dated checks. MakeMyTrip's Jaisalmer discovery page was inspected for the separation of attractions, experiences, season planning and booking; its copy, photographs and branding were not copied.

References: [Rajasthan Tourism](https://www.tourism.rajasthan.gov.in/jaisalmer.html), [MakeMyTrip architecture reference](https://www.makemytrip.com/tripideas/places-to-visit-in-jaisalmer), [Google tag queue](https://developers.google.com/tag-platform/gtagjs), [manual pageviews](https://developers.google.com/analytics/devguides/collection/ga4/views), [consent setup](https://developers.google.com/tag-platform/security/guides/consent).

## Ongoing measurement

Google controls crawl scheduling, sitemap processing and index inclusion. After submission, review indexing reasons and actual queries in Search Console, then prioritize improvements from impressions and useful booking outcomes. Core Web Vitals require field data or a later laboratory run. The existing 30/60/90-day plan remains in [SEO-OPERATIONS.md](SEO-OPERATIONS.md).
