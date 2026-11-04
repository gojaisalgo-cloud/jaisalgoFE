# Vercel deployment and persistent storage

The initial deployment returned HTTP 500 because public catalogue reads tried to create `.data` on Vercel. A read-only filesystem and separate serverless instances cannot serve as a shared booking database.

## Connect storage

1. Create a hosted **libSQL** database, such as a Turso libSQL database. The current driver is `@libsql/client`; choose the libSQL engine, not the newer Turso engine. No new subscription or database has been created automatically.
2. In Vercel → this project → Settings → Environment Variables, add `DATABASE_URL` (for example `libsql://your-database.turso.io`) and `DATABASE_AUTH_TOKEN` using the provider's actual connection values. Select Production and any Preview environments you use. Never commit a real token or paste it into the chat. The standard `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` names are also accepted. Explicit `DATABASE_*` values take precedence.
3. Redeploy after saving environment variables. The application creates its existing tables and seeds missing catalogue entries on the first database connection. Existing rows and bookings are preserved.

Vercel uses `@libsql/client/web` to access shared storage over HTTP. Local development retains its existing SQLite database and Node client. No financial transaction, inventory, payment signature or refund rule was replaced.

## Behavior before connection

Home, packages, package details, editorial pages and sitemap render without trying to create a database file. Catalogue fallback uses the existing provisional seed data only when hosted storage is unconfigured. It does not mask failures of a configured database or override edited supplier prices.

Online checkout displays a temporary-unavailability state; booking APIs return HTTP 503 with `STORAGE_UNAVAILABLE`. They never open a payment order without durable storage. First-party analytics and verified financial PostHog delivery require storage. Optional consented public-browser PostHog analytics can work independently when its public project configuration is supplied; see [PostHog setup](POSTHOG_ANALYTICS.md). The travel desk shows setup instructions. Existing routes and local booking behavior remain intact.

File URLs, memory databases, `/tmp`, insecure remote URLs and database URLs containing embedded username/password credentials are rejected on Vercel. No temporary database is used for bookings or inventory. Database initialization retries after failures instead of preserving a rejected promise for the function's lifetime.

## Launch checks

Public deployments now default to `BOOKING_MODE=live` and fail closed until configured. Use explicit `BOOKING_MODE=test` or `demo` only in a separate nonproduction environment while validating. Configure administrator credentials and the verified business/support details separately. Test actual persistence and transaction behavior against a hosted libSQL database in a non-live environment before enabling live payments. The existing live gates still require reviewed suppliers/taxes, confirmed venue where required, refund terms, gateway credentials/webhook, and real departure capacity.

Sources: [Vercel filesystem support](https://vercel.com/docs/functions/runtimes#file-system-support), [Turso on Vercel](https://docs.turso.tech/integrations/vercel), [Turso libSQL quickstart](https://docs.turso.tech/quickstart).
