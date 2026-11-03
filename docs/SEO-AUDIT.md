# SEO audit — 3 November 2026

## Scope and evidence

Next.js 16.4.3 App Router, React 19.2, Node 20.20.2. The homepage, package listing and package pages use request-time server rendering with the existing published libSQL catalogue (or the explicit provisional catalogue when hosted storage is not configured). Editorial pages use the existing catch-all route and static content. No route migration is needed.

Before editing, HTTP checks against the existing production build on port 3001 confirmed public pages return 200, unknown packages return 404, checkout pages already declare `noindex`, and public content does not require login. The installed Next.js metadata, JSON-LD, sitemap, robots, image and not-found guides were consulted. No ranking, keyword-volume or Core Web Vitals measurements are inferred from these checks.

## Prioritized findings

| Priority | Actual issue | Affected URLs | Required fix |
| --- | --- | --- | --- |
| P1 | Canonicals and sitemap use `https://jaisalgo.com`, while production redirects to `https://www.jaisalgo.com/`. | All public pages | Use one validated production origin across metadata, social cards, schema and sitemap. Preserve all existing paths. |
| P1 | Package and listing Open Graph titles/descriptions inherit the homepage. | `/packages`, `/packages/[slug]` | Generate complete page-specific metadata instead of shallow inheritance. |
| P1 | Package itinerary, accommodation and price sections are conditionally mounted after a tab click. | `/packages/[slug]` | Render every section in the initial HTML while retaining the existing progressive disclosure controls. |
| P1 | `robots.txt` disallows checkout/ticket routes, preventing compliant crawlers from seeing their existing `noindex`. | `/book/*`, `/reservations/*`, `/my-bookings`, `/admin` | Allow fetching noindex pages; retain authentication and booking access checks. Add private response headers. Robots rules are not access control. |
| P1 | SEO copy advertises a ₹99 flow without distinguishing the currently unavailable live booking service. | Homepage/listing metadata | Use truthful comparison/estimate descriptions; do not publish offer prices or live-availability schema from provisional models. |
| P2 | Every sitemap URL has an identical hard-coded lastmod unrelated to its source data. | `/sitemap.xml` | Use editorial content dates and an optional recorded catalogue content date; omit unknown dates. Never use request/build time as freshness. |
| P2 | Any query string triggers noindex, including harmless campaign parameters. | `/packages`, editorial pages | Canonicalize tracking parameters; noindex actual sort/filter/selection variants only. |
| P2 | Structured data is limited to breadcrumbs and a subset of guides. | Homepage, catalogue, packages, editorial | Add safe, visible-data-matched WebSite/Organization, ItemList, TouristTrip and Article graphs. No invented reviews, business credentials or Product eligibility. |
| P2 | Poetic listing/guide headings obscure the subject; contextual links between guides and actual packages are sparse. | Collections and articles | Preserve visual styling; clarify subjects, add compact contextual links, related published packages and a guide table of contents where useful. |
| P2 | Standalone package hero is lazy-loaded; `next/image` still uses deprecated `priority` internally. | Package details, shared Photo | Preload only the main image, preserve responsive sizes and lazy loading elsewhere. |
| P2 | There is no repeatable server-rendered SEO audit. | Entire site | Add a read-only HTTP audit for metadata, H1s, schema, sitemap, links, assets, status codes, variants and private noindex. |

## Existing strengths to preserve

- Stable lowercase package slugs, genuine day-wise source data, explicit missing supplier facts, no fabricated customer ratings.
- Native `next/image`, local WebP files and local variable fonts; source/licence attribution is already present.
- Existing 404 behavior, anchor navigation, mobile layout, minimal name/mobile booking flow and payment verification gates.
- Existing consent-gated first-party analytics and server-verified, deduplicated financial events. No GA4 installation is required.

## Limits requiring operator data or external access

No hosted production booking database, confirmed supplier inventory, verified business address/contact, Search Console property access or CrUX field data has been supplied. The work must not bypass those gates or claim live offers, successful Google verification, sitemap submission, rankings or Core Web Vitals results. The SEO implementation report records checks, setup steps and the 30/60/90-day measurement plan.
