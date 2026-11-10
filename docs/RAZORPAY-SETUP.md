# Razorpay production setup

The existing Standard Checkout supports the ₹99 reservation amount, full package payment and the eligible remaining balance. Orders and amounts come from the server. A browser callback alone never confirms a booking: the server verifies its signature and fetches the payment from Razorpay before issuing a ticket. Failed/pending payments, retries, refunds and duplicate notifications retain the existing booking rules.

## Server configuration

Save the matching live `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` as **Production secrets** in the JaisalGo Vercel project. Set `BOOKING_MODE=live`. Do not prefix secrets with `NEXT_PUBLIC_`, put them in source, or copy them into a source archive. The public key ID is returned only for the appropriate checkout; the API secret stays on the server. Keep test credentials and test inventory in a separate environment.

On 10 November 2026, the supplied live credential pair authenticated successfully through a read-only Razorpay API request (HTTP 200). The API key ID and secret were saved to the ignored local `.env.local` with `BOOKING_MODE=live` and file permissions restricted to the owner. No order or charge was created. Credentials are never included in the GitHub commit.

The supplied CSV does not include a webhook signing secret. Local checkout remains unavailable until `RAZORPAY_WEBHOOK_SECRET` is configured to match the merchant dashboard. Production environment configuration and redeployment must be completed separately; a GitHub push does not copy local secrets to the hosting provider.

## Webhook

In the correct merchant's **Live** Razorpay dashboard, open Accounts & Settings → Webhooks. Inspect existing endpoints before adding another. Use:

- URL: `https://www.jaisalgo.com/api/payments/webhook`
- Events: `payment.captured`, `payment.failed`, `refund.created`, `refund.processed`, `refund.failed`
- A private webhook signing secret, also saved as the Production secret `RAZORPAY_WEBHOOK_SECRET` in Vercel.

Do not substitute the API key secret for a missing webhook secret. Preserve an existing signing secret when an endpoint is already configured; changing it affects verification of older notification retries. Redeploy after environment changes. Verify delivery in Razorpay; an unsigned request must never be accepted as a valid event.

The handler verifies the raw request signature before parsing, refetches the payment identified in the event, validates its order/amount/currency, reconciles verified refunds and deduplicates fulfillment. Razorpay's refund payloads include both refund and payment entities. Unknown/failed reconciliation returns a non-success status so Razorpay can retry. `order.paid` is not required by this handler.

## Remaining launch requirements

Valid gateway keys alone do not unlock live bookings. Connect durable hosted libSQL storage, configure the actual seller identity and administrator access, and review supplier costs, taxes, venue, cancellation terms and actual departure capacities through the existing travel desk. Never mark provisional seed packages approved just to activate a payment button. See [deployment setup](VERCEL-DEPLOYMENT.md) and [booking launch requirements](BOOKING-LAUNCH.md).

Use Razorpay test keys in an isolated test environment for end-to-end gateway tests. A real live payment requires the account owner's participation. Automated booking tests use fixtures, not the supplied live secret. After a verified capture, check the ticket, ₹99 deduction/full-payment total, balance timing, My Bookings access and refund status.

References: [Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/), [Razorpay webhook setup](https://github.com/razorpay/markdown-docs/blob/master/payments/dashboard/account-settings/webhooks.md), [refund event payloads](https://github.com/razorpay/markdown-docs/blob/master/webhooks/refunds.md).
