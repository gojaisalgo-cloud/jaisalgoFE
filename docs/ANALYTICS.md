# First-party conversion analytics — 3 November 2026

The optional PostHog integration was added on 4 November; see [POSTHOG_ANALYTICS.md](POSTHOG_ANALYTICS.md) for its separate persistent anonymous browser identity, consent, vendor payloads and activation requirements. This document describes the original first-party report.

Existing local Next.js application enhanced in place. The original implementation introduced no external vendor, new account flow or change to financial settlement rules. Admin → Analytics provides rolling 24-hour / 7-day / 30-day windows and separate live, test and demo reports. No historical baseline or experiment results are fabricated.

## Privacy and data boundary

Anonymous usage events require optional consent; decline does not affect booking. Privacy preferences in the footer reopen the choice. Do Not Track / Global Privacy Control prevent client collection. Anonymous session IDs expire after 30 minutes of inactivity and are kept per browser tab; one package checkout attempt per session is used for behavioral rates. No persistent customer/user identifier is created. Strict schemas reject names, phone, email, arbitrary URLs, private access keys and payment references. Client event names cannot include server verification/confirmation milestones. Sources are finite categories; campaigns must be explicitly allowlisted in ANALYTICS_CAMPAIGNS. Unknown campaign strings are grouped as other. Referrer/UTM URLs are never transmitted.

Withdrawal removes the current session's client events and attribution on operational financial events, and removes its optional measurement context from booking snapshots. Revoked sessions cannot re-ingest. Necessary booking and payment ledgers remain intact. Anonymous events expire after 180 days; pruning runs on the next ingestion (at most hourly) and report read. No background tracking or advertising scripts. Server payment milestones remain anonymous operational measurements even without usage consent. ANALYTICS_ENABLED=false stops collection.

## Event dictionary

Client: website_visit, package_viewed (visible card or detail route), package_info_opened, book_now_clicked, reservation_99_clicked, date_selected, travellers_selected, variant_selected, checkout_started, payment_initiated, booking_abandoned (departure signal only), booking_error, availability_failed, ticket_generated, ticket_failed, support_clicked, social_proof_viewed.

Server: checkout_created, payment_order_created, payment_authorized, payment_failed, payment_review, reservation_payment_verified, booking_confirmed, balance_payment_completed, refund_recorded, cancellation_requested, captured_payment_review, trip_completed. Deterministic event IDs make retries and signed-webhook replays idempotent. Milestones follow committed provider-validated payment / booking ledger records. Failed analytics writes never undo or prevent payments, refunds or tickets. No real payments were made during QA.

All monetary fields are integer paise. Package IDs are verified against the catalogue. Events attach only explicitly selected package/date/traveller/variant choices and safe device/source/campaign categories. No form serialization. Ticket events contain package ID only; matching to an anonymous attempt requires the same consented booking context.

## KPI denominators and financial definitions

- Visit → package: distinct consented visiting sessions with a package view / distinct consented visiting sessions; goal 30%.
- Package → Book now: distinct package-viewing sessions clicking Book now / distinct package-viewing sessions; goal 15%.
- Started → deposit: distinct consented package attempts matched to server-verified ₹99 payments / consented checkout starts; goal 35%.
- Visit → reservation: distinct consented visiting sessions matched to reservations / consented visiting sessions; goal 3%. Nonconsenting sales never enter this numerator.
- Reservation → fully paid: fully paid active bookings / verified reservation cohort; goal 60%. Cohorts are created within the reporting window and observed through now. Recent trips may not be due yet; this is not a due-only rate.
- Payment success: unique captured token-order attempts / unique resolved captured-or-failed token-order attempts; goal 95%. Authorized/pending orders are reported separately. A retry does not create another successful order.
- Abandonment: attempts inactive at least 30 minutes, unpaid and without payment/availability/connection/processing failures / mature started attempts; goal ≤40%. Closing/hiding a tab alone is not abandonment. The departure signal is not a financial outcome. Unresolved initiated payments stay in processing until a closed-window or verified outcome signal; they are not presumed abandoned.
- Mobile time: average active visible time before verified deposit, excluding gateway/verification wait, for matched observed mobile attempts; goal ≤90 seconds. Coverage shown; cross-device and unobserved timings are unavailable.
- Ticket success: observed successful QR generations / eligible consented bookings with an observed QR outcome; goal 99%. Coverage shown. This is not a claim about unobserved tickets or ticket download success.
- Technical error rate: consented attempts with network/technical error signals / consented checkout starts; goal <1%.

Client occurrence times are bounded to the previous 30 minutes at ingestion; payment timestamps remain server-owned. Stage reach uses sessions for the first four stages and attempts thereafter. Stage counts can branch or be skipped; conversion cards show matched denominators instead of subtracting independent counts into misleading sequential drop-offs. Reporting starts from stored installation baseline, not a hardcoded date. Daily rows use India dates.

₹99 is a deposit, never a completed sale. North star = verified reservations that are fully paid, unrefunded, active and explicitly marked completed by an operator after travel. A date passing does not mark a trip complete. Completion markers are reversible and cannot change financial status. The north star is shown for the selected reservation cohort.

Gross booking value = package contract totals for verified reservations. Net customer funds = actual verified ledger receipts less refunds (before fees and operating costs), not recognized accounting revenue. AOV covers fully paid active contracts. Net / completed trip covers actual completed paid trips. Contribution / completed trip requires actual expenses AND actual gateway fees for every completed trip in the cohort; missing values display Not recorded. RPV is attributed net customer funds / consented sessions only. Daily campaign spend is operator supplied and replaces the same environment/date/campaign total. Spend / completed trip is a CAC proxy; true new-customer CAC and accounting revenue recognition are unavailable without a reliable source.

## Trust and reliability

No testimonials or proof are invented. Exposure accepts only configured authentic proof IDs (ANALYTICS_AUTHENTIC_PROOF_IDS) on explicitly marked data-authentic-proof elements. No such proof is installed by default. Observed exposure comparisons suppress rates below five sessions and do not imply causality. No A/B test is active. Geography remains unavailable without a consented coarse source; no IP location is collected.

Support clicks are automatic; actual question categories, unclear-information cancellation feedback, first response minutes, spend, actual costs and trip completion are recorded by an authenticated operator. No support messages or contact details enter analytics. Manual inputs are not inferred from clicks.

Diagnostics flag unverified / unapproved live confirmations, ledger mismatches, checkout total mismatches, unresolved duplicate captures and confirmed inventory above configured departure capacity. They are monitoring signals, not a guarantee that zero issues will ever occur. Existing provider verification, idempotency, price validation and atomic inventory controls remain authoritative.

Admin reports and actions require the existing HttpOnly signed admin session; writes also require same origin, bounded strict JSON and rate limits. Report responses are no-store. Reporting is bounded at 100,000 event/booking rows; exceeding it fails visibly rather than silently sampling. Analytics is stored in the existing private database and has no public report endpoint.

## Rollout

1. Days 1–7: verify consent, financial matching, event completeness, failures and duplicate replay before relying on targets.
2. Days 8–30: establish the baseline and identify matched drop-offs with adequate samples.
3. Days 31–60: predeclare hypothesis, primary metric, guardrails, randomized assignment, required sample size and stopping rule; test one change at a time. No lift claims from observational segments.
4. Days 61–90: evaluate due balances, completed trips, actual refunds/costs and contribution, not just CTA clicks.

Use persistent private database storage in production. Set safe campaign/proof allowlists in .env.local; never commit real credentials. No external integration or publication was performed.
