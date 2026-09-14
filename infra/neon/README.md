# Neon and Drizzle

Create separate staging and production Neon projects or isolated branches.

- `DATABASE_URL` is the pooled runtime URL used by Next.js.
- `DATABASE_URL_UNPOOLED` is for trusted local/administrative tasks.
- `NEON_PROJECT_ID` is an identifier for deployment and operational tooling.

The repository exposes an HTTP client for ordinary Next.js requests and a
bounded Neon WebSocket pool for explicit interactive transactions. Pooled
connections use a small pool by default and expose `close()` for tests and
controlled shutdown. It intentionally does not create commerce tables or run
migrations.

Use `withPooledDb()` for a transaction that needs a WebSocket session; it
closes the pool in a `finally` block. Do not cache a WebSocket pool across
Vercel serverless requests.
Better Auth's core/plugin schema must be generated and migrated as part of the
database phase before phone login is enabled.

Use the pooled connection string from Neon for `DATABASE_URL` (the hostname
contains `-pooler`). Keep `DATABASE_URL_UNPOOLED` for Drizzle Kit, migrations,
and other trusted administrative work. Do not use the unpooled URL for normal
application requests.
