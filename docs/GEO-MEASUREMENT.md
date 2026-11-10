# GEO measurement and operating record — 10 November 2026

## Baseline

Before this release, production `9fde4f5` had 89 canonical pages, 132 internal targets, 18 image assets, zero critical HTTP SEO issues, and no distinct AI referral category. Search Console was verified today and processed 89 sitemap URLs. Performance and indexing reports were still processing. GA4 was activated today; there is no established historical AI, search or field-performance trend. Named-engine citation/mention baselines are **not measured**, not zero. The baseline crawl does not measure rankings, model citations or Google index inclusion.

## What is measured after release

- Existing private Travel desk → Analytics now has an AI referral cohort: consenting sessions whose observed entry referrer is an approved AI-service hostname; package-detail sessions, ledger-verified reservations, session conversion and net collected amounts. The same period/environment filters apply. Raw referring URLs, prompt text, IP addresses and location are not stored.
- PostHog preserves only approved public-page paths and allowlisted referral origins; AI sources have their own category. It remains consent gated. These data are observational and can be spoofed or omitted; they are not proof of a citation.
- GA4's existing sanitized public-page views support landing-page engagement reporting. The adapter deliberately strips referring URLs; do not assume GA4 provides the new first-party AI cohort or a complete AI attribution report.
- Search Console: review actual clicks/impressions, queries and pages; separate branded query variants such as JaisalGo/JaisAlgo from generic destination queries. Google AI features are included in normal Search reporting where Google reports them; the site cannot reliably separate them from a generic Google referrer.
- Bing Webmaster Tools: use the owner's Microsoft/Google account to add or import the www property. This release supports a genuine HTML verification token via `BING_SITE_VERIFICATION` in Vercel Production. No account permission or verification token is fabricated. Submit the existing canonical sitemap after verified ownership. Property metrics require actual account setup and processing.

## Weekly manual citation check

Use the same prompt, language, locale and account/search settings. Run each target engine separately: ChatGPT Search, Google AI Overviews/AI Mode or Gemini, Perplexity and Copilot. Record date, engine/version if visible, locale, whether web search was enabled, the exact prompt, JaisalGo mention, cited canonical URL, competing cited URLs and a screenshot/link. Mark no AI answer or unavailable access explicitly. Avoid repeatedly querying until a desired citation appears. Do not treat personalized results as a universal rank.

Suggested fixed prompts:

1. What are the best places to visit in Jaisalmer for a first trip?
2. How should I spend two days in Jaisalmer?
3. What is a practical three-day Jaisalmer itinerary?
4. Should I choose Sam or Khuri for a desert stay?
5. How do I compare camel and jeep safaris in Jaisalmer?
6. Where should I stay in Jaisalmer: city, Sam or Khuri?
7. What does a Jaisalmer trip cost, including travel and extras?
8. How should international tourists plan Jaisalmer within Rajasthan?

Use `GEO-CITATION-LOG.csv` for observations. The initial rows are marked unmeasured; no fabricated model answer or citation is recorded. Monthly, compare the same prompt set and report citations/eligible observations with the denominator and access limitations. Keep organic clicks, identifiable referrals, verified reservations and AI mentions as separate measures.

## Review cadence

Weekly: citation sample, unexpected crawler/indexing exclusions, broken canonical links and actual travel-source changes. Monthly: compare landing-page engagement and consented AI/search cohorts, then prioritize useful answers over new doorway pages. Quarterly: review source dates, expired suppliers/transport references, image rights and real-user Core Web Vitals when sufficient data exists. Google controls crawling/indexing; no llms.txt, schema type or answer panel guarantees inclusion or citations.
