# SEO setup, measurement and 30/60/90-day plan

## Production and Google Search Console

The canonical origin is `https://www.jaisalgo.com`. The existing Vercel domain configuration redirects the apex to www; Next.js normalizes trailing slashes. Canonicals, social URLs, schema and sitemap all use the same production origin. Keep `NEXT_PUBLIC_SITE_URL=https://www.jaisalgo.com` in Production. Preview builds declare noindex. The recent nameserver migration must be fully reachable over normal HTTPS before testing Google access.

1. In [Search Console](https://search.google.com/search-console), add the Domain property `jaisalgo.com` using the owner’s Google account. It covers the protocol/host variants. Add Google’s actual verification TXT record at the authoritative DNS provider (currently Vercel DNS), then click Verify. Keep the verification record. Do not replace nameservers, A records or existing mail records to verify ownership. See [Google’s verification methods](https://support.google.com/webmasters/answer/9008080?hl=en).
2. Alternatively add the URL-prefix property `https://www.jaisalgo.com/`. The app supports the HTML-tag method through `GOOGLE_SITE_VERIFICATION`: set the real token in Vercel Production and redeploy, then verify. No token is present or invented in the repository. The env option does not perform account verification itself.
3. Submit `https://www.jaisalgo.com/sitemap.xml` in Sitemaps once, then inspect its processing status and discovered URLs. Ordinary travel pages do not use Google’s Indexing API. Do not automate repeated submissions or fake crawler requests. [Sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
4. Use [URL Inspection](https://support.google.com/webmasters/answer/9012289?hl=en) on the homepage, `/packages`, one package and one guide. Check live fetching, rendered content, declared canonical and Google-selected canonical. A successful live fetch does not mean the URL has been indexed. Request indexing for important materially updated pages only when appropriate.
5. In Page indexing, distinguish intentional exclusions (filtered variants, checkout, tickets and draft policies) from accidental failures on public pages. Investigate canonical mismatches, server errors and discovered/crawled-not-indexed URLs. Noindex is not an authentication or privacy boundary.
6. Test representative deployed graphs in [Rich Results Test](https://search.google.com/test/rich-results) and [Schema Markup Validator](https://validator.schema.org/). TouristTrip is descriptive Schema.org markup, not a promise of a supported Google rich result. FAQ content is for users; no FAQ rich-result claim is made.

No Search Console account has been verified or sitemap submitted by this implementation. Those actions require the owner’s account and genuine verification record.

## Rerunnable engineering checks

Use Node 20.9+ and the existing dependency lockfile. Python 3 is required only for the standard-library HTTP audit/admin integration script.

```sh
npm run test
npm run typecheck
npm run build
npm run lint
npm run test:admin
npm run start -- -p 3001
```

In a second terminal:

```sh
npm run audit:seo -- --base-url http://127.0.0.1:3001 --json /tmp/jaisalgo-seo-audit.json
```

After deployment:

```sh
npm run audit:seo -- --base-url https://www.jaisalgo.com --json /tmp/jaisalgo-seo-production.json
```

For an accessible Vercel preview, provide its URL and `--preview`; its canonical origin should still be production. Deployment protection may require a manual authorized check. Never disable certificate validation to make an audit pass.

The audit checks every sitemap page, metadata uniqueness, a single H1, canonical targets, social metadata, JSON parsing and supported graph invariants, real HTML itinerary text, incoming links, internal target statuses, images/alt, robots directives, private-page headers, tracking/selection variants, 404s and slash normalization. It makes read-only requests and never starts a payment or creates a booking. It does not certify Google rich-result eligibility, execute a browser accessibility suite or measure field performance.

Keep sitemap lastmod truthful: editorial entries carry actual content-review dates. Admin saves record `contentModifiedAt` only when normalized public content changes. Older package rows without a known content timestamp omit lastmod until a meaningful edit. Request time, build time and an unchanged Save do not refresh content dates. The current site is far below the 50,000-URL sitemap limit; splitting adds no value yet.

## Analytics and reporting structure

Retain the existing first-party, opt-in measurement system. No GA4 tag, personal URL logging or extra conversions were added. No new mandatory input or email is required. Analytics remain disabled when durable storage is unconfigured; customer payments remain governed by the existing live gates.

| Requested milestone | Existing measurement | Interpretation |
| --- | --- | --- |
| `view_package` | `package_viewed` / `package_info_opened` | The first includes card visibility. Use the second for a page/details-panel engagement, not a card impression. |
| `select_package` | `book_now_clicked` | Existing booking-link action |
| `begin_reservation` | `checkout_started` | Consented attempt begins; this is not a sale |
| `reservation_payment_success` | `reservation_payment_verified` | Server-verified token capture, deduplicated by booking attempt |
| `booking_complete` | `booking_confirmed` | Confirmed reservation after verified capture; separate from fully paid or travelled |
| Fully paid / trip fulfilled | `balance_payment_completed` / `trip_completed` | Verified full payment / operator-recorded fulfilment safeguards |

Do not emit renamed aliases alongside these events; that would double-count conversions. The authenticated analytics report now adds an `organic` object and a collapsible Organic search panel without changing existing totals or API fields. It matches same-window consented `source=search` sessions to verified ledger bookings. It reports search/detail sessions, verified reservations, conversion rates, fully paid bookings, completed trips, net funds and net collections for completed trips. Detail engagement must precede the booking to count as a detail conversion. Pending/authorized/unverified payments do not count. Refunds reduce collected funds. Missing denominators produce null, not a fabricated rate.

`netCollectedPaise` and `completedTripNetCollectedPaise` are customer-fund measurements in paise, not accounting revenue recognition or profit. Unattributed/nonconsenting bookings are excluded from organic attribution but remain in the existing financial totals. Query strings, names, mobile numbers and ticket/access keys are not added to analytics.

| Metric | Real source | Reporting grain |
| --- | --- | --- |
| Impressions, organic clicks, CTR, average position | Search Console Performance | Same country/device/search type; page and query; distinguish branded queries |
| Indexed canonical pages and exclusion reasons | Search Console Page indexing / URL Inspection | Canonical production URLs; compare against sitemap |
| Organic landing-page performance | Search Console Pages dimension | Canonical landing page; avoid joining aggregate Google clicks to named users |
| Search sessions and detail engagement | Consented first-party report | Same time window and environment; source `search` |
| Organic reservations and matched conversion | New `organic` report | Verified ledger outcomes matched to the consenting session cohort |
| Full payment, fulfilled trips, collections/refunds | Existing ledger + `organic` report | Live data separately from demo/test; paise converted to INR for display |
| LCP / INP / CLS | Search Console Core Web Vitals / CrUX | Mobile and desktop URL groups; real 75th-percentile observations |

Save the first real 28-day baseline after launch, noting deployment date, consent coverage, live-mode readiness, seasonal events and any outages. Do not infer that Google clicks equal measured sessions. No keyword, traffic, ranking, conversion or revenue baseline currently exists in the delivered report.

## Prioritized roadmap

### First 30 days: make measurement trustworthy

1. Connect persistent booking storage and complete supplier, tax, departure, contact and policy requirements before enabling real reservations. Validate actual transaction persistence and webhook outcomes in test mode.
2. Complete Search Console verification, sitemap submission and representative URL inspections. Resolve accidental public-page errors first; retain deliberate private/variant noindex.
3. Record the first real search and booking baseline. Segment branded/nonbranded queries and mobile/desktop. Review whether Google chose the intended www canonical.
4. Run the HTTP audit after catalogue/routing changes. Resolve the documented pre-existing React lint issues in a separately scoped component maintenance pass.

### Days 31–60: improve the pages with demonstrated demand

1. Use actual query/page data to choose a small number of underperforming package snippets and guides. Improve missing answers before creating more pages.
2. Replace missing supplier details with verified property/vehicle/meal/child/entry facts and licensed real supplier photos. Reassess offer markup only when complete prices and availability are genuine and visible.
3. Add guides or departure-specific pages only for distinct useful content supported by real operations. Avoid thin origin-city or near-identical duration pages.
4. Examine measured mobile performance and booking drop-offs. Prioritize the actual slow interaction/image/chunk revealed by evidence, rather than chasing a synthetic score alone.

### Days 61–90: assess outcomes without promising ranks

1. Compare equivalent periods and account for seasonality, holidays, launch effects and consent coverage. Report impressions, nonbranded clicks and qualified landing-page growth alongside verified reservations.
2. Review organic reservation-to-full-payment and trip fulfilment; net refunds and actual expenses before discussing business value.
3. Inspect indexing and canonical coverage after content edits. Fix missing or orphaned products before expanding the catalogue.
4. Evaluate real-user targets: LCP ≤2.5 seconds, INP ≤200 ms and CLS ≤0.1 at the 75th percentile. These are targets, not measured outcomes. A new site may have insufficient field data. [Google’s Core Web Vitals report](https://support.google.com/webmasters/answer/9205520?hl=en).

Engineering completion (correct metadata, crawlable content, healthy links/schema and preserved booking behavior) is separate from business outcomes. Google controls crawling, indexing and ranking; no position, traffic or conversion increase is guaranteed.
