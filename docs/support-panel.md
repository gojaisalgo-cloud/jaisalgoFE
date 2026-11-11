# JaisalGo support desk

The bottom-left help launcher opens a responsive travel-desk panel. Calls, travel guides and the ₹99 reservation link work for guests. Chat is a callback enquiry, not a live agent conversation. It requires a valid customer session both in the panel and on `POST /api/support`.

A signed-in traveller provides their name, phone, question and explicit WhatsApp/callback consent. The server sends these fields to the existing private travel-desk group through the existing GREEN-API configuration (`WHATSAPP_API_URL`, `WHATSAPP_INSTANCE_ID`, `WHATSAPP_API_TOKEN`, `WHATSAPP_GROUP_ID`, `WHATSAPP_GROUP_INVITE_URL`). No new credentials are required. Invalid or absent configuration fails closed with the phone alternative.

Only a successful provider response containing `idMessage` produces the callback confirmation. This means accepted by WhatsApp's API, not proof that a staff member has read the message or a guaranteed response time. Ambiguous sends are marked for review and never automatically retried. Same request IDs do not generate duplicate messages. Requests are limited to three per account per hour, with a second process-local limit.

`support_deliveries` stores only a request hash, hashed owner, delivery state and creation time; contact details and questions are not retained in this database or sent to product analytics. Metadata older than 30 days is removed on subsequent submissions. WhatsApp group retention remains the travel desk's responsibility. Existing replay controls block forms and mask text. No credentials, Google token, email or booking access keys are sent with callback requests.

Verification: `node --import tsx --test tests/support.test.ts` covers validation, provider acceptance, idempotency, missing confirmation and durable rate limiting. These tests mock the provider and send no real messages. An unauthenticated HTTP submission must return 401; cross-origin submissions must return 403. To verify actual delivery, an account holder can sign in, consent and submit their own test enquiry, then check the private group.
