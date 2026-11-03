# Pan-India Jaisalmer discovery · 3 November 2026

## What changed

The existing Next.js 16 App Router site now has an origin-planning directory and six individually written travel guides. They lead to the same published local catalogue and existing checkout, not new origin-departure products. Existing `/packages`, `/book`, ticket, admin, API, payment, inventory and refund behaviour remains in place. No email field, new authentication step, SEO dependency, geolocation service or external tracking tag was added.

The preceding technical SEO work already supplied the www canonical origin, unique existing-page metadata, private-page noindex, crawler-visible itineraries and honest structured data. This change extends those foundations. The gaps were the absence of a city directory, researched origin guidance, a publication gate, a pan-India keyword backlog and target-market reporting.

## Published pages

Canonical directory: [Plan Jaisalmer from your city](https://www.jaisalgo.com/jaisalmer-travel-from).

| Guide | Canonical URL | Distinct planning value |
| --- | --- | --- |
| Delhi / New Delhi | https://www.jaisalgo.com/jaisalmer-travel-from/delhi | NCR access time, boarding-station identity, Delhi rail versus dated air choices, usable local days |
| Ahmedabad | https://www.jaisalgo.com/jaisalmer-travel-from/ahmedabad | Ahmedabad/Kalupur versus other stations, complete weekend timing, separately priced Gujarat travel |
| Surat | https://www.jaisalgo.com/jaisalmer-travel-from/surat | Unverified nonstop claims, interchange risk, camp arrival deadlines, longer local stay planning |
| Vadodara / Baroda | https://www.jaisalgo.com/jaisalmer-travel-from/vadodara | Local departure versus Ahmedabad repositioning, ground-transfer cost, the Western Railway corridor distinction |
| Jaipur | https://www.jaisalgo.com/jaisalmer-travel-from/jaipur | Dated road/rail comparison, a separately planned Jodhpur stop and Rajasthan-circuit budgeting |
| Bengaluru / Bangalore | https://www.jaisalgo.com/jaisalmer-travel-from/bengaluru | Delhi/Mumbai gateway research, protected versus separate tickets, travel days outside the local stay |

These pages are also served by the existing Vercel production alias. Metadata and sitemap URLs consistently use `https://www.jaisalgo.com`; no duplicate alias-site canonicals are introduced. Existing resolver/SSL propagation is separate from application SEO.

Permanent 308 aliases: `new-delhi` and `delhi-ncr` → `delhi`; `baroda` → `vadodara`; `bangalore` → `bengaluru`. Alias URLs never enter the sitemap. Gurgaon/Gurugram remains a research candidate, with NCR connection context on Delhi’s guide. Noida and other candidates do not receive thin pages or automatic redirects to a loosely related city. Unknown, unsupported, typo-only and draft origin routes return 404/noindex.

## Data and publication architecture

- `data/india-markets.ts`: 103 market records across all 28 states and 8 UTs, canonical names, aliases, state, market group and editorial priority tier. This is a **research backlog**, not measured demand or a route generator.
- `data/city-guides.ts`: six separate manuscripts, metadata, mode-specific travel advice, timing qualifications, local itinerary links, group guidance, budgets, arrival tips, FAQs, source scope, real related package IDs and review flags/date.
- `lib/city-travel.ts`: one publication gate used by routes, directory, alias resolution and sitemap. A name or flags alone cannot publish. Complete advice, multiple sources, source references, source-review status/date and at least one currently published local experience are required. Package cards use the current server catalogue and omit unpublished products.
- `app/jaisalmer-travel-from/page.tsx` and `[city]/page.tsx`: server-rendered pages with async params/metadata following the installed Next.js documentation. Runtime catalogue reads preserve admin publication changes.
- `components/city-discovery.tsx`: semantic region-grouped anchors, only to eligible guides. Six guides do not need a search box. Home, package planning links, existing editorial links and the trip-brief page provide entry points; every guide links back to its hub and to local products. No hundreds-of-city footer.
- `app/sitemap.ts`: eligible canonical city guides only, real recorded source-review dates and documentary destination-image URLs. Existing package/editorial rules remain intact.

Publication checks are structural safeguards, not automatic fact-checking or editorial approval. The six current manuscripts were source-checked during this implementation, not approved by an invented human team or supplier. Every new guide needs a deliberate manuscript/source review before setting `reviewStatus: 'source-checked'`, `published: true`, `indexable: true`, and updating the small analytics key allowlist. Review exact content for duplication; passing a minimum length alone does not justify publication. Recheck sources when schedules change and at least every 90 days; update the review date only after real review. Do not publish an empty record or clone the same article with city replacements.

## Sources, limitations and factual choices

Research checked on 3 November 2026:

- [Rajasthan Tourism: Jaisalmer](https://www.tourism.rajasthan.gov.in/jaisalmer.html): Delhi rail connection, road links with Jaipur/Jodhpur/Bikaner and destination context. The page’s broad flight list is **not a current timetable**.
- [Air India: winter 2026 network announcement](https://www.airindia.com/in/en/newsroom/press-release/Air-India-bolsters-winter-network-with-new-routes-to-Khajuraho-and-Jaisalmer.html): seasonal Mumbai–Jaisalmer service from 25 October 2026 and Delhi connectivity. Used to identify possible gateways, not to guarantee protected connecting tickets.
- [Ahmedabad district](https://ahmedabad.nic.in/how-to-reach/): airport and station identities. Historical route details do not establish live departures.
- [Vadodara district](https://vadodara.nic.in/how-to-reach/): rail-junction and regional road context. Historical fares, bus frequency and driving times are deliberately not copied.
- [Bengaluru Urban district](https://bengaluruurban.nic.in/en/how-to-reach/): airport gateways and rail hubs. Older airline contact lists are not adopted.
- [Indian Railways enquiry](https://enquiry.indianrail.gov.in/mntes/), [RSRTC](https://rsrtconline.rajasthan.gov.in/), [IndiGo](https://www.goindigo.in/): live provider checks for readers. A search link is not evidence of a bookable service or fare.

No current rail timetable, through-bus departure, direct flight from Surat/Ahmedabad/Jaipur/Bengaluru, transport fare or fixed origin-to-destination journey duration was sufficiently verified for publication. Each guide says to use dated provider results; recommendations such as three local days are editorial itinerary suggestions, **not measured transit times**. Adding approximate times now would manufacture precision. Supplier accommodation, origin pickups and food arrangements remain based on actual package data; no city implies Jain meals, a private room or a specific hotel.

## Keyword ownership and expansion candidates

`PAN-INDIA-KEYWORDS.csv` maps all 103 markets and aliases to query candidates, priority, intended guide path and publication state. These are qualitative intent hypotheses from the brief, not keyword-volume research. No search-volume, ranking or conversion data was available. Priority tiers follow the user’s requested initial markets; reorder using verified search and booking evidence.

| Intent | Existing owner / approach |
| --- | --- |
| Jaisalmer tour packages; Jaisalmer ghumne ka package | `/packages`, with actual local-product details |
| Desert safari price / camp booking | Actual activity/camp package and existing budget guide; no separate page for every combination |
| 2 days / 1 night; 3 days / 2 nights | Actual `city-and-dunes` / `golden-city-escape` product and distinct existing itinerary guides |
| Couples / honeymoon | Existing `couples-escape`; do not imply honeymoon amenities not in the data |
| Family / groups / budget / premium | Actual `family-jaisalmer`, `friends-adventure`, `budget-desert`, `premium-desert`; group and room charges stay in current pricing |
| Package from Delhi, Surat, Baroda, Bangalore, etc. | Source-reviewed origin planning guide with clearly separate independent transport; never an unsupported departure product |
| Jaisalmer trip ka kharcha | Existing `/travel-guide/budget-planning`; origin guides explain additional travel costs |
| Delhi se Jaisalmer kaise jaye | Delhi guide’s natural FAQ, not a separate keyword or language doorway |
| Jaiselmer typing error | Correct destination spelling and useful site navigation; no typo-only indexable route |

Next candidates: Mumbai, Pune, Hyderabad, Rajkot, Jodhpur and Udaipur. NCR candidates Noida/Gurugram/Ghaziabad need genuinely distinct departure/access research to justify separate guides. The remaining Gujarat/Rajasthan cities, Tier 2 metros and Tier 3 candidates stay absent from navigation and sitemap until useful manuscripts exist. Jaisalmer itself maps to `/packages`, not an origin-to-itself guide.

Remaining states/UTs are explicitly evaluated in the backlog: Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura, Andaman and Nicobar Islands, Dadra and Nagar Haveli and Daman and Diu, Ladakh, Lakshadweep and Puducherry. They require first/last-leg research, date feasibility and actual search evidence before priority increases. No state hub is published: there is not yet enough distinct editorial coverage to warrant another indexable layer.

## Metadata and structured data

Examples before the inherited `| JaisalGo` brand suffix:

- Delhi: `Jaisalmer Trip from Delhi · Travel & Local Packages`.
- Surat: `Jaisalmer Trip from Surat · Connections & Local Packages`.
- Vadodara: `Vadodara to Jaisalmer Trip · Baroda Travel Guide`.
- Bengaluru: `Jaisalmer Trip from Bangalore · Bengaluru Travel Guide`.

Descriptions are individually written and reflect the actual guide. Page-specific OG/Twitter images use existing licensed photos and alt text. Each guide renders an Article and BreadcrumbList with matching visible headline, source-review date, canonical URL and visible citations. The directory renders ItemList anchors. Existing Organization identity remains factual; no invented TravelAgency address, reviews, Offers, ₹99 product price or origin TouristTrip is added. FAQ answers are crawlable HTML; no FAQ rich-result claim is made. Query filters follow current canonical/noindex rules; campaign parameters do not create alternate content pages.

## Measurement, Search Console and actual geography

Added opt-in `city_guide_viewed` and `city_package_clicked`, plus an allowlisted city-guide ID on the first measured session entry. Raw URLs, query strings, names, mobile numbers and IP geography are not recorded. Existing consent, session expiry, retention, withdrawal and server financial ledgers stay in use. The authenticated dashboard has a compact target-market panel; it never labels a target city as the visitor’s actual city.

- Guide-to-package CTR: unique consenting sessions clicking a package link **after** viewing that guide / unique consenting guide sessions. A details-panel interaction without navigation is not a package-link click.
- Organic entry cohort: first measured session event was a city guide and search-attributed. Later guide visits do not rewrite the landing target. Consent granted mid-session starts measurement there; it cannot reconstruct a pre-consent landing.
- Organic detail sessions, checkout starts, verified ₹99 deposits, fully paid bookings and completed trips follow that entry and the same report-window cohort. Financial outcomes require both stored booking and verified ledger amounts. Pending payments do not count; actual refunds reduce net collections. Net collections are not accounting revenue.
- Market rollups deduplicate sessions within the group. Delhi NCR is a target market group, not an Indian state. The full city-to-state map remains separate.
- Google impressions, non-brand clicks, CTR, positions and indexed URLs are not available in first-party event logs. Actual visitor city/state is unavailable; do not infer it from a search term or guide visit.

Owner steps: verify Domain property `jaisalgo.com` using Google’s real DNS TXT value at the existing authoritative DNS provider; retain other DNS records. Submit `https://www.jaisalgo.com/sitemap.xml` once. Inspect the hub and six canonical guides and confirm declared/Google-selected canonicals. Use Search Console Performance → Page filters for each guide or regex `^https://www\.jaisalgo\.com/jaisalmer-travel-from/`; export query/page data. Separate brand terms (`jaisalgo`, `jaisalgo`) from non-brand travel terms; group actual query variants with the CSV and keep unmatched queries visible. Search Console’s country dimension is actual coarse search geography, not state/city. Small/private query omissions and average-position aggregation limit conclusions. Use Page indexing and sampled URL Inspection for index coverage, not impressions as proof of indexing. No Indexing API, artificial traffic or automated repeated submissions.

## Hindi and 90-day rollout

No partial Hindi translation or artificial hreflang was added. One natural Hinglish FAQ is useful within an English guide, but is not a Hindi alternative. Evaluate real query/support demand, commission a complete human-reviewed Hindi version of the budget and first-visit guides, then add dedicated URLs, reciprocal en-IN/hi-IN hreflang, correct language markup and self canonicals. Indian city targets alone do not need hreflang or meta-geolocation tags.

1. **Days 1–30:** verify production sitemap/404s/mobile links; complete Search Console ownership; collect a real baseline by guide; recheck flight/rail sources; finish hosted database, supplier approvals, tax/policies and gateway readiness before real reservations. Validate opt-in events and ledger matching using test-mode data.
2. **Days 31–60:** prioritize Mumbai, Pune, Hyderabad, Rajkot, Jodhpur/Udaipur using actual query impressions, useful connection evidence and bookable local experiences. Publish only distinct researched manuscripts; add relevant contextual links. Improve titles with meaningful impressions and diagnose mobile booking drop-offs without adding inputs.
3. **Days 61–90:** compare cohorts with adequate samples, review refunds and completed-trip net collections, merge overlapping guides with permanent redirects where appropriate. Update weak source claims and seasonality. Evaluate a fully translated Hindi pilot; expand other states only when unique content and observed demand justify it.

There is no ranking or conversion guarantee. The unconfigured hosted database still blocks production reservations and analytics safely; this SEO release does not remove those gates. See `SEO-OPERATIONS.md` for existing ownership, audit and measurement procedures and `PAN-INDIA-VERIFICATION.md` for the recorded checks and changed files.
