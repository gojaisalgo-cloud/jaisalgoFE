# GEO audit and implementation roadmap — 10 November 2026

## Baseline before implementation

Production commit: `9fde4f5`. Next.js 16.4.3, server-rendered public pages, local responsive WebP images and local fonts. Existing architecture: 89 indexable canonical URLs; one homepage, public hubs, 24 real catalogue products, seven comparison collections, 37 editorial guides and ten source-reviewed origin guides. Booking/customer/payment routes are noindex and capability/auth protected. The full read-only production crawl is recorded separately in the final report. No measured AI-citation share, AI referral baseline, rank or field Core Web Vitals pass is available. Search Console was only verified today; sitemap processing succeeded with 89 discoveries, not 89 confirmed indexed pages.

## Prioritized roadmap

| Priority | Finding | Implementation |
| --- | --- | --- |
| Critical | Preserve transaction accuracy and private data | Keep prices, ₹99 flow, signed/captured payment verification, WhatsApp lifecycle and private-page exclusions unchanged. No public booking or payment feed. |
| High | Most guide answers are embedded in long editorial sections | Add concise question-led answers, relevant visible FAQs and selected comparison tables in server-rendered HTML. Preserve URLs and unique intent. |
| High | Schema lacks consistent page/attraction relationships | Add truthful WebPage and TouristAttraction entities with stable IDs and cross-references to the existing destination and organization. Do not invent LocalBusiness/TravelAgency/Hotel/Offer facts. |
| High | No transparent editorial methods/correction policy | Publish factual organization attribution and source/review criteria. Distinguish source checks from named expert or first-hand review. Preserve photography licences and the limits of provisional estimates. |
| High | AI referrals blend into generic referral/search buckets | Add a finite source classifier and consent-gated AI cohort in the existing reporting architecture. Discard raw referring URLs; distinguish identifiable referrals from invisible AI-search exposures. |
| Medium | Pune absent; accommodation choice/night planning fragmented | Add a source-reviewed Pune guide and useful stay-area/night-visit guides. Link existing food, culture, safari, city and itinerary clusters rather than publishing synonym duplicates. |
| Medium | Crawler access and rich-data checks need repeatable coverage | Test named crawlers against existing wildcard robots rules and public HTML. Validate representative pages with Schema.org Validator and Google Rich Results Test. |
| Medium | No concise machine-oriented resource directory | Add a curated llms.txt linking canonical public pages, with reservation/price caveats; it is supplemental and has no guaranteed ranking effect. |
| Low | No controlled citation-monitoring baseline | Provide a repeatable manual prompt register, engine/date/locale/evidence fields and follow-up cadence. No fabricated engine answers or automated scraping. |
| Low | Field metrics and Bing property measurements are unavailable | Inspect available accounts and establish actual status. Provide verification readiness if account authorization or ownership is required. Do not claim unavailable metrics. |

## Source and business boundaries

Content reuses official Rajasthan Tourism, Incredible India and dated origin/transport sources. No individual expert, original on-site inspection, owned hotel, street address, social profile, testimonial or supplier partnership is established by this repository. Do not fabricate these to satisfy a schema checklist. Google says ordinary SEO requirements remain applicable to its AI search features; special AI files or schema are not required. SearchBot/training crawler permissions are separate concepts. Existing public access preferences remain unchanged unless the operator requests otherwise.

References: https://developers.google.com/search/docs/appearance/ai-features ; https://developers.openai.com/api/docs/bots ; https://docs.perplexity.ai/docs/resources/perplexity-crawlers ; https://schema.org/TouristAttraction .
