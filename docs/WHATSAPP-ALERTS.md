# Paid-booking WhatsApp alerts

Verified live payment capture creates a durable alert in the same database transaction as the booking. Browser callbacks alone, unsigned webhooks, failed/authorized payments, test/demo payments, and captured payments requiring refund review cannot send a paid-booking alert. Repeated callbacks reuse the unique payment record and notification. Both the Razorpay callback and signed webhook schedule the sender after the HTTP response; notification delivery errors do not undo the booking or block ticket access.

Alerts contain the booking reference, package, travel date, traveler count, customer name/mobile, received amount, collected total, estimated package total, balance and supplier-confirmation state. They exclude private ticket capabilities, customer free-text requests, provider credentials and payment signatures. Checkout informs travelers that the operational team may receive their booking/contact details on WhatsApp. The group invite and API credentials remain in server environment variables, never browser bundles or source.

## Sender setup

Use a GREEN-API WhatsApp instance linked to a phone already in the intended group. The account owner completes account registration and scans the linking QR code. Retrieve the group's actual `@g.us` ID from the linked account's group list and check its subject/participants against the intended group. An invite link is not an API recipient ID.

Set these server variables in Vercel Production, then deploy:

```
WHATSAPP_API_URL=https://<server>.api.greenapi.com
WHATSAPP_INSTANCE_ID=<instance number>
WHATSAPP_API_TOKEN=<private API token>
WHATSAPP_GROUP_ID=<verified group ID ending @g.us>
WHATSAPP_GROUP_INVITE_URL=https://chat.whatsapp.com/<private invite code>
```

The private invite is hashed to bind queued notifications to the intended destination. Changing this reference leaves earlier alerts queued for review instead of forwarding them into another group. Existing historic payments are not automatically backfilled. Records captured before a target was configured are not automatically sent. Do not expose these settings through `NEXT_PUBLIC_` variables. Sender availability and plan limits are controlled by GREEN-API; the integration does not purchase a plan.

## Delivery and retries

`booking_alerts` stores `pending`, `sending`, `accepted`, `review` and `cancelled` states. A conditional lease prevents two workers from sending the same pending row at once. A returned `idMessage` records acceptance into GREEN-API's queue; it does not prove delivery to every participant. Refunded/cancelled bookings are checked again before dispatch and suppressed. Authentication failures and rate limits are retried with backoff. Unknown outcomes (timeouts, missing receipts, stale sending leases or other provider errors) enter `review` rather than automatically risking a duplicate message.

New booking/payment requests drain a small batch after responding. For independent retries, run `npm run booking:alerts:retry` in the configured server environment, or call `GET /api/internal/booking-alerts` with `Authorization: Bearer <CRON_SECRET>`. This endpoint returns aggregate counts and never customer details. An external scheduler must be configured separately; no paid scheduling plan is enabled by this change. Before manually retrying a `review` record, check the provider's outgoing-message journal/group history to determine whether the message was accepted.

## Validation

Automated tests cover verified-capture gating, repeat callback deduplication, concurrent worker claims, sender/recipient validation, rate-limit retries, unknown-outcome review, refunds/cancellations, environment separation and exclusion of private ticket access. Real group delivery requires a linked sender, matching group configuration and an actual verified payment or a separately authorized test message.

Provider references: [send messages to groups](https://green-api.com/en/docs/api/sending/SendMessage/), [get chats](https://green-api.com/en/docs/api/service/GetChats/), [group metadata](https://green-api.com/en/docs/api/groups/GetGroupData/).
