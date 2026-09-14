# Eshanika services setup plan

Status: service setup baseline implemented; provider dashboard configuration and
staging smoke tests remain manual.

This plan prepares the external services and their Turborepo packages. It deliberately does not implement the storefront, admin panel, catalogue, checkout, order-history screens, WordPress extraction, data migration, redirects, or production cutover. Those are separate pieces of work.

The selected baseline is:

- Next.js applications in apps/store and apps/admin
- Turborepo with pnpm and TypeScript
- Drizzle ORM
- Neon PostgreSQL
- Better Auth with the Drizzle adapter
- 2Factor.in for Indian phone OTP through Better Auth's phone-number plugin
- Resend for application email
- Cloudflare R2 for media and private documents
- Razorpay for payments
- Inngest for asynchronous durable workflows
- oRPC for the typed application API and TanStack Query for client data fetching
- Cloudflare DNS/CDN, Turnstile, Bot Fight Mode, WAF, and rate limiting
- Vercel for the commercial Next.js deployment

## 1. Scope and non-goals

### Included

This file covers:

1. Accounts and projects to create.
2. The service-oriented package layout.
3. Provider SDKs and adapter boundaries.
4. Environment variables and secret ownership.
5. Neon database connection and Drizzle bootstrapping.
6. Better Auth configuration.
7. Phone OTP delivery through 2Factor.
8. Resend email configuration.
9. R2 bucket and access configuration.
10. Razorpay test/live configuration.
11. Inngest application and function endpoint configuration.
12. Cloudflare DNS, edge security, Turnstile, and bot protection.
13. Optional analytics setup.
14. Health checks, fake providers, service smoke tests, and deployment configuration.
15. Parallel agent execution and handoff contracts.

### Explicitly excluded

Do not implement these as part of service setup:

- WordPress API extraction or import scripts.
- Product, category, customer, order, payment, or invoice migration.
- The final commerce database schema.
- Storefront pages, cart, checkout, account pages, or admin UI.
- Order-history behavior.
- Search indexing.
- Shipping-provider integration.
- Redirect mapping or DNS cutover.
- Production data backfill or reconciliation.

The database package should be wired and testable, but domain tables can be added later during the application and migration work.

## Agent execution model

This document is written as a set of agent briefs. The implementation keeps
the same package boundaries without requiring separate agents or generated API
code.

### Execution order

The work can be completed in three waves:

1. Agent 00, the foundation agent, creates the package shells, shared configuration, environment contract, and service interfaces.
2. Agents 01 through 09 run in parallel. Each agent owns one service package and its dedicated platform adapter or infrastructure notes.
3. Agent 99, the integration and verification agent, runs after all parallel agents finish. It installs dependencies once, checks cross-package contracts, and runs the complete service smoke-test suite.

If the agent runner supports worktrees, use one worktree per agent. If all agents share one worktree, pre-create the package directories first and enforce the ownership table below. Agents must not edit another agent's package.

### Agent ownership and dependencies

| Agent | Workstream     | Primary ownership                                                                | Can run                 |
| ----- | -------------- | -------------------------------------------------------------------------------- | ----------------------- |
| 00    | Foundation     | Root workspace, package shells, shared types, env contract, validation contracts | First                   |
| 01    | Database       | packages/db and Neon/Drizzle configuration                                       | Parallel wave           |
| 02    | Auth           | packages/auth and Better Auth settings documentation                             | Parallel wave           |
| 03    | Phone OTP      | packages/messaging and Better Auth phone plugin integration                      | Parallel wave           |
| 04    | Email          | packages/email and Resend setup documentation                                    | Parallel wave           |
| 05    | File uploads   | packages/storage, Better Upload, R2 setup, admin upload route adapter            | Parallel wave           |
| 06    | Payments       | packages/payments, Razorpay webhook adapter in apps/store                        | Parallel wave           |
| 07    | Workflows      | packages/workflows, Inngest route adapter in apps/store                          | Parallel wave           |
| 08    | Edge security  | packages/security and Cloudflare configuration                                   | Parallel wave           |
| 09    | Analytics      | packages/analytics and consent-safe event contract                               | Parallel wave, optional |
| 99    | Integration QA | Cross-package checks, dependency install, smoke tests, final report              | Last                    |

Agents 02 and 03 share a provider boundary but may work concurrently. Agent 03 must consume the documented Better Auth sendOTP contract and must not edit packages/auth. Agent 05 owns the upload API route; Agent 06 owns the payment webhook route; Agent 07 owns the Inngest route, so those app files do not conflict.

### Shared rules for every agent

- Work only within the files listed in your brief.
- Do not implement storefront UI, admin UI, catalogue logic, checkout logic, order history, or migration logic.
- Do not create product, customer, order, invoice, or payment domain tables.
- Do not edit another service package.
- Do not edit pnpm-lock.yaml while agents are running in parallel. Agent 99 installs dependencies and resolves the lockfile once after merges.
- Do not add real credentials, tokens, API keys, or production data.
- Provide a fake provider and a service-level test where practical.
- Use typed provider-neutral interfaces at package boundaries.
- Return a report containing files changed, dependencies added, environment variables required, dashboard actions, tests run, and unresolved decisions.

### Agent 00: foundation brief

Objective: make the workspace safe for concurrent service implementation.

Own:

- Root package manager and Turbo configuration.
- packages/eslint-config, packages/typescript-config, packages/env, packages/types,
  packages/validation.
- Empty package shells and package exports for agents 01 through 09.
- Shared provider error, health-check, correlation-ID, and redaction types.
- The shared environment-variable contract.

Do:

1. Create the package directories from the target tree.
2. Add consistent package.json, tsconfig, exports, and typecheck scripts.
3. Define environment schemas without real values.
4. Define provider-neutral result and failure types.
5. Define service health-check interfaces.
6. Add Turbo tasks for build, typecheck, lint, test, and integration tests.
7. Document package ownership in the foundation report.

Do not:

- Add provider SDK implementations.
- Add domain schemas.
- Add application routes.
  Acceptance:

- Every parallel agent can work inside its package without changing root conventions.
- Client and server environment variables are separated.
- A clean typecheck works with placeholder implementations.

### Agent 01: database brief

Objective: configure Neon PostgreSQL for Drizzle without creating the commerce schema.

Own:

- packages/db.
- Neon database setup notes under infra/neon if needed.

Do:

1. Configure the Neon connection and serverless driver.
2. Add Drizzle and the postgres driver.
3. Use the Neon HTTP driver for ordinary serverless queries and document the transaction strategy.
4. Implement a shared client, SELECT 1 health check, and test cleanup.
5. Add drizzle.config.ts without domain tables.
6. Document staging and production connection separation.

Acceptance:

- Staging health check succeeds when credentials are supplied.
- The package typechecks.
- No product, customer, order, invoice, or migration tables are created.

### Agent 02: authentication brief

Objective: configure Better Auth client and server boundaries.

Own:

- packages/auth.
- Better Auth configuration and route checklist.

Do:

1. Implement the Better Auth server instance and browser client.
2. Keep BETTER_AUTH_SECRET and database access server-only.
3. Implement session, user, sign-out, phone-OTP request, and phone-OTP verification helpers.
4. Document redirect URL and cookie requirements.
5. Add fake/session test coverage.

Acceptance:

- Browser code cannot import BETTER_AUTH_SECRET or database credentials.
- Phone OTP helpers use Better Auth's phone-number plugin lifecycle.
- Better Auth's generated core/plugin schema is the only auth schema prepared in this phase; commerce schema migration remains separate.

### Agent 03: phone OTP brief

Objective: deliver Better Auth-generated OTPs through 2Factor.in.

Own:

- packages/messaging.
- Better Auth phone plugin integration and 2Factor setup notes.

Do:

1. Implement the 2Factor adapter using the phone number and code supplied to Better Auth's sendOTP callback.
2. Validate the Better Auth callback input and provider response.
3. Apply the approved DLT template and sender configuration.
4. Add safe timeout/error behavior and redacted logging.
5. Add a fake SMS provider and Better Auth callback contract tests.
6. Document SMS first and WhatsApp as a later channel.

Acceptance:

- Better Auth generates the OTP; the 2Factor adapter does not generate or verify a second code.
- The real send waits for provider acceptance and does not enqueue the immediate send in Inngest.
- OTP values and API keys never appear in logs or test snapshots.

### Agent 04: email brief

Objective: configure Resend as the application email provider.

Own:

- packages/email.
- Resend domain and DNS setup notes.

Do:

1. Implement a typed Resend client.
2. Add a plain service-test email.
3. Add fake email transport and retry/permanent-failure classification.
4. Document SPF, DKIM, DMARC, sender, reply-to, staging, and production keys.
5. Define email ownership so Auth emails and application emails are not duplicated.

Acceptance:

- A staging email can be sent when a key is supplied.
- The package returns a provider-neutral message ID.
- Sensitive recipient and payload data are redacted from logs.

### Agent 05: file upload brief

Objective: configure Cloudflare R2 uploads through Better Upload.

Own:

- packages/storage.
- apps/admin/src/app/api/upload/route.ts.
- R2 and Better Upload setup notes.

Do:

1. Add Better Upload server and client packages.
2. Configure the Better Upload server router with the Cloudflare/R2 S3-compatible client.
3. Create separate public-media and private-document upload routes.
4. Use route-level file type, count, size, metadata, and expiry restrictions.
5. Use an authentication/authorization callback before generating pre-signed URLs.
6. Generate controlled object keys; never use arbitrary client-provided paths.
7. Keep R2 credentials server-only.
8. Add public URL and signed private download helpers.
9. Add fake storage tests and one staging upload smoke test.

Better Upload uses pre-signed URLs so files go directly from the browser to R2. The Next.js route is a thin adapter; reusable storage configuration remains in packages/storage.

Acceptance:

- Public media and private documents cannot use each other's route or bucket.
- Unauthenticated and invalid-file uploads are rejected before a URL is issued.
- The app does not proxy file bytes through the Next.js server.

### Agent 06: payments brief

Objective: configure the Razorpay provider boundary.

Own:

- packages/payments.
- apps/store/src/app/api/payments/razorpay/webhook/route.ts.
- Razorpay test/live setup notes.

Do:

1. Implement server-only Razorpay initialization.
2. Implement signature verification and normalized webhook parsing.
3. Add idempotency and duplicate-event contracts without domain persistence.
4. Configure test-mode keys and a staging webhook.
5. Add fake payment events and signature tests.

Acceptance:

- The webhook route verifies the signature before handing off an event.
- No client-supplied amount is trusted by the provider package.
- Turnstile is not required on the Razorpay callback.

### Agent 07: workflows brief

Objective: configure Inngest for durable asynchronous work.

Own:

- packages/workflows.
- apps/store/src/app/api/inngest/route.ts.
- Inngest setup notes.

Do:

1. Add the typed Inngest client.
2. Define a provider-neutral event catalog.
3. Add a service-ping function and a retry demonstration.
4. Add registration and route adapter.
5. Document what must remain synchronous, especially OTP and payment verification.
6. Add redacted event logging and non-blocking failure behavior.

Acceptance:

- A staging service-ping event reaches a registered function.
- A controlled retry is visible.
- No authentication secret or OTP appears in the event payload.

### Agent 08: edge security brief

Objective: configure Cloudflare edge protection and Turnstile verification.

Own:

- packages/security.
- infra/cloudflare.

Do:

1. Implement server-side Turnstile verification.
2. Document staging and production widgets/hostnames.
3. Document Cloudflare DNS, Full (strict) TLS, Bot Fight Mode, WAF, and rate-limit rules.
4. Add rules for OTP, login, recovery, contact, public APIs, and admin paths.
5. Document exceptions for Razorpay and other signed provider callbacks.
6. Add valid/invalid Turnstile tests.

Acceptance:

- Invalid or missing Turnstile tokens fail server verification.
- Provider callbacks are not blocked by browser challenges.
- Rule order and staging test cases are documented.

### Agent 09: analytics brief

Objective: prepare an optional consent-aware analytics boundary.

Own:

- packages/analytics.

Do:

1. Define an event-name allowlist.
2. Define payload rules that exclude phone numbers, email addresses, addresses, and secrets.
3. Document staging and production data streams.
4. Keep analytics calls out of authentication and payment correctness paths.

Acceptance:

- The package can remain disabled without affecting the application.
- No personally identifiable data is included by default.

### Agent 99: integration and verification brief

Objective: integrate the parallel service packages and produce the final setup report.

Own:

- Root lockfile after all parallel branches are merged.
- Cross-package tests and service smoke-test documentation.
- The final agent report.

Do:

1. Merge or inspect all agent outputs.
2. Install dependencies once and resolve duplicate/version conflicts.
3. Run build, typecheck, lint, unit tests, and integration tests.
4. Confirm environment schemas match every package.
5. Confirm route adapters import only their intended packages.
6. Run staging smoke tests using test credentials only.
7. Confirm no unrequested service package or environment variable was added.
8. Produce a final report with pass/fail status and remaining manual dashboard steps.

## Agent handoff contract

Every service agent must return this information:

| Field            | Required content                                       |
| ---------------- | ------------------------------------------------------ |
| Status           | Complete, partial, or blocked                          |
| Files changed    | Exact paths                                            |
| Package owner    | Package name and public exports                        |
| Dependencies     | Packages added; do not modify the lockfile in parallel |
| Environment      | Variable names only, never values                      |
| Dashboard work   | Account, project, DNS, webhook, or callback settings   |
| Tests            | Commands and results                                   |
| Security review  | Secrets, authentication, rate limits, redaction        |
| Manual follow-up | Anything the user must configure                       |
| Handoff notes    | Contracts expected from other agents                   |

## Agent merge checklist

Before accepting an agent's work:

- It changes only owned paths.
- It has no credentials or production data.
- It has a fake or deterministic test.
- It has a typed package export.
- It uses the shared env and error contracts.
- It does not implement migration or application-domain logic.
- It documents any provider dashboard action.

## 2. Provider decision summary

| Capability               | Initial provider                                  | Owner package                          |                      Required now | Agent   |
| ------------------------ | ------------------------------------------------- | -------------------------------------- | --------------------------------: | ------- |
| Web hosting              | Vercel first, Coolify later                       | apps/store and apps/admin adapters     |                               Yes | 00 / 99 |
| PostgreSQL               | Neon PostgreSQL                                   | packages/db                            |                               Yes | 01      |
| Authentication           | Better Auth                                       | packages/auth                          |                               Yes | 02      |
| Indian phone OTP         | 2Factor.in through Better Auth phoneNumber plugin | packages/messaging                     |    Yes if phone login is required | 03      |
| Application email        | Resend                                            | packages/email                         |                               Yes | 04      |
| File uploads and storage | Better Upload + Cloudflare R2                     | packages/storage                       |                               Yes | 05      |
| Background workflows     | Inngest                                           | packages/workflows                     | Yes when async work is introduced | 07      |
| DNS/CDN/security         | Cloudflare                                        | packages/security and infra/cloudflare |                               Yes | 08      |
| Payments                 | Razorpay                                          | packages/payments                      |    Yes before payment development | 06      |
| Product analytics        | GA4                                               | packages/analytics                     |                          Optional | 09      |
| Cache/rate-limit store   | Upstash Redis                                     | Optional packages/cache                |                          Optional | Future  |

The only deployment entrypoints outside packages are thin platform adapters. For example, Vercel needs Next.js routes for Better Auth, uploads, Inngest, and Razorpay webhooks. The provider clients and reusable logic remain under packages.

### oRPC + TanStack Query

oRPC is part of the current plan. The implementation uses one typed router in
`packages/api/src/router.ts`, a fetch handler in `packages/api/src/handler.ts`,
and thin `/api/rpc` route adapters in both Next.js apps.

- `@orpc/server` owns the router and request handler.
- `RequestHeadersPlugin` forwards request headers so Better Auth can read the
  session cookie in protected procedures.
- `@orpc/client` exposes a typed client without generated code.
- `@orpc/tanstack-query` exposes `queryOptions` and `mutationOptions` helpers.
- Both apps install a shared TanStack Query provider in their root layout.

Keep domain procedures small and server-authoritative. `health.ping` is public
for smoke checks and `account.me` is the initial protected example. Customer,
admin, and owner permissions are intentionally deferred until the domain schema
and admin-role phase; do not add role behavior to this setup.

## 3. Target service-only Turborepo layout

    apps/
      store/
        src/app/
          api/
            auth/[...all]/route.ts
            rpc/[[...path]]/route.ts
            inngest/route.ts
            payments/razorpay/webhook/route.ts
      admin/
        src/app/
          api/
            auth/[...all]/route.ts
            rpc/[[...path]]/route.ts
            upload/route.ts
        next.config.ts
        package.json

    packages/
      auth/
        src/
          auth.ts
          client.ts
          server.ts
          next.ts
          index.ts
        package.json

      api/
        src/
          router.ts
          handler.ts
          client.ts
          query.ts
          index.ts
        package.json

      db/
        src/
          client.ts
          schema/
            auth.ts
            index.ts
          health.ts
          index.ts
        drizzle.config.ts
        package.json

      env/
        src/
          server-schema.ts
          client-schema.ts
          index.ts
        package.json

      email/
        src/
          client.ts
          send.ts
          index.ts
        package.json

      messaging/
        src/
          twofactor.ts
          provider.ts
          index.ts
        package.json

      storage/
        src/
          better-upload-router.ts
          upload.ts
          r2.ts
          object-keys.ts
          index.ts
        package.json

      payments/
        src/
          razorpay-client.ts
          signatures.ts
          index.ts
        package.json

      workflows/
        src/
          client.ts
          events.ts
          functions/
          index.ts
        package.json

      security/
        src/
          turnstile.ts
          request-signing.ts
          index.ts
        package.json

      analytics/
        src/
          index.ts
        package.json

      validation/
        src/
          provider-schemas.ts
          index.ts
        package.json

      types/
        src/
          providers.ts
          index.ts
        package.json

    infra/
      neon/
        README.md
      cloudflare/
        README.md
        turnstile.md
        waf-rules.md
      vercel/
        README.md
      coolify/
        README.md

No migration package is included in this service-only setup. A future migration package can be added later without changing the provider boundaries.

## 4. Package responsibilities

### packages/env

Purpose:

- Validate server and browser environment variables with Zod.
- Keep secret variables unavailable to client bundles.
- Fail early during build or startup when a required production variable is missing.
- Separate staging and production schemas.

Rules:

- Only variables explicitly marked public may use a NEXT_PUBLIC_ prefix.
- BETTER_AUTH_SECRET, database URLs, Razorpay secrets, R2 secrets, Inngest signing keys, Resend keys, and Turnstile secrets are server-only.
- Never expose BETTER_AUTH_SECRET or DATABASE_URL to browser code.
- Never log an environment variable or provider token.

### packages/api

Purpose:

- Own the typed oRPC router and shared application context.
- Expose the fetch handler used by the `/api/rpc` routes.
- Export the typed client and TanStack Query helpers for both apps.
- Resolve Better Auth sessions in protected procedures.

Do not put database or provider credentials in the client export. Add domain
procedures here as the application is built; keep the Next.js route adapters
thin.

### packages/db

Purpose:

- Create the Drizzle database client.
- Expose a typed health check.
- Own Drizzle configuration and the selected PostgreSQL driver.
- Provide transaction helpers for later application packages.

- Neon implementation:

- Use drizzle-orm, @neondatabase/serverless, and drizzle-kit.
- Use the Neon HTTP driver for ordinary serverless request/response queries.
- Use the Neon WebSocket driver when an interactive transaction is required.
- Keep the connection lifecycle compatible with serverless and edge execution.
- Keep any direct or pooled connection string available only for trusted server-side and local database work.
- A database health check should execute a minimal read such as SELECT 1.

This phase does not create the commerce schema. It proves that the package can connect, run a typed query, and close connections correctly.

### packages/auth

Purpose:

- Create the Better Auth server instance.
- Create the Better Auth browser client.
- Expose the Next.js Better Auth route adapter.
- Phone OTP request and verification helpers.
- Auth redirect URL helpers.
- Session and user identity types.
- Better Auth core and plugin schema definitions.

Use better-auth/minimal with the Drizzle adapter when appropriate to reduce the server bundle. Keep BETTER_AUTH_SECRET and database access server-only.

### packages/messaging

Purpose:

- Provide a narrow sendOtp contract.
- Implement the 2Factor.in OTP adapter.
- Validate the provider response.
- Redact phone numbers and provider payloads in logs.
- Provide a fake adapter for local and automated tests.

Better Auth generates the OTP and calls the configured sendOTP callback. The adapter only delivers the supplied phone number and code to 2Factor; it does not generate or verify a second code.

### packages/email

Purpose:

- Initialize the Resend client.
- Provide a typed sendEmail function.
- Define a small service-only test email.
- Centralize sender, reply-to, tags, and unsubscribe policy.
- Provide a fake email adapter for tests.

Application email templates can be expanded later. Better Auth email callbacks and application email delivery must have an explicit ownership split so the same message is not sent twice.

### packages/storage

Purpose:

- Initialize the S3-compatible Cloudflare R2 client.
- Create object keys.
- Generate short-lived signed upload/download URLs.
- Expose public URL construction for public media.
- Prevent direct exposure of R2 credentials.
- Provide a fake storage adapter for tests.

Use separate public and private buckets or clearly separated prefixes. Private objects such as invoices must never be served from an unprotected public URL.

### packages/payments

Purpose:

- Initialize Razorpay server client.
- Create server-side payment orders later.
- Verify checkout signatures.
- Verify webhook signatures.
- Normalize Razorpay webhook events.
- Provide an idempotency key contract for later order implementation.
- Provide a fake provider for tests.

The package must never accept the payable amount as trusted client input. The final amount must come from server-side domain data when checkout is implemented.

### packages/workflows

Purpose:

- Initialize the Inngest client.
- Define typed event names and payloads.
- Register durable functions later for emails, payment reconciliation, inventory work, and notifications.
- Expose a local smoke-test function.
- Keep the Inngest route adapter in the Next.js app.

Use Inngest for asynchronous or retryable work. Do not put immediate OTP delivery, payment signature verification, or a user-facing synchronous response behind an Inngest event.

### packages/security

Purpose:

- Verify Cloudflare Turnstile tokens server-side.
- Provide request-signature helpers for internal callbacks.
- Hold provider callback allowlist and validation helpers.
- Provide consistent rate-limit decision types.

Cloudflare WAF and Bot Fight Mode are configured in Cloudflare. The package verifies application-level Turnstile tokens; it does not replace Cloudflare edge rules.

### packages/analytics

Purpose:

- Define an event-name allowlist.
- Normalize ecommerce event payloads.
- Keep analytics calls out of payment and authentication correctness paths.
- Support consent-aware initialization.

This package is optional and can remain a stub until analytics and consent requirements are approved.

### packages/types and packages/validation

Purpose:

- Share provider-neutral types.
- Validate auth callback, webhook, email, storage, and payment payloads at boundaries.
- Prevent provider-specific response shapes from leaking throughout the application.

## 5. Accounts and projects to create

Create separate staging and production resources where the provider supports them.

| Service       | Staging setup                                   | Production setup                                              |
| ------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| Vercel        | One preview/staging project or environment      | One production project                                        |
| Neon          | One staging project/branch                      | One production project/branch                                 |
| 2Factor       | Test account/API key and DLT test configuration | Production account, sender/template approval, billing balance |
| Resend        | A verified staging sender/domain                | A verified production sender/domain                           |
| Cloudflare R2 | Staging public/private buckets                  | Production public/private buckets                             |
| Razorpay      | Test mode keys and webhook                      | Live mode keys and webhook                                    |
| Inngest       | A staging app/environment                       | A production app/environment                                  |
| Cloudflare    | Preview hostname rules                          | Production zone and DNS proxy                                 |
| GA4           | Optional staging data stream                    | Optional production data stream                               |

Suggested names:

- Neon projects/branches: eshanika-staging and eshanika-production.
- Inngest apps: eshanika-staging and eshanika-production.
- R2 buckets: eshanika-media-staging, eshanika-private-staging, eshanika-media-production, and eshanika-private-production.

## 6. Environment variable contract

Keep the names stable even if a provider is changed later.

### Core

    NODE_ENV
    APP_ENV
    APP_URL
    NEXT_PUBLIC_APP_URL

### Better Auth and Neon database

    BETTER_AUTH_SECRET
    BETTER_AUTH_URL
    BETTER_AUTH_TRUSTED_ORIGINS
    DATABASE_URL
    DATABASE_URL_UNPOOLED
    NEON_PROJECT_ID

DATABASE_URL is the runtime Neon connection. Keep DATABASE_URL_UNPOOLED for trusted administrative or local database tasks only.

### 2Factor

    TWOFACTOR_API_KEY
    TWOFACTOR_OTP_TEMPLATE_NAME
    TWOFACTOR_SENDER_ID

The exact 2Factor template and sender values must match the approved Indian DLT template.

### Resend

    RESEND_API_KEY
    RESEND_FROM_EMAIL
    RESEND_REPLY_TO

### Cloudflare R2

    R2_ACCOUNT_ID
    R2_ACCESS_KEY_ID
    R2_SECRET_ACCESS_KEY
    R2_PUBLIC_BUCKET
    R2_PRIVATE_BUCKET
    R2_PUBLIC_BASE_URL

### Razorpay

    NEXT_PUBLIC_RAZORPAY_KEY_ID
    RAZORPAY_KEY_ID
    RAZORPAY_KEY_SECRET
    RAZORPAY_WEBHOOK_SECRET

Only the public key may be browser-visible.

### Inngest

    INNGEST_APP_ID
    INNGEST_EVENT_KEY
    INNGEST_SIGNING_KEY
    INNGEST_DEV
    INNGEST_BASE_URL

### Cloudflare and Turnstile

    NEXT_PUBLIC_TURNSTILE_SITE_KEY
    TURNSTILE_SECRET_KEY
    CLOUDFLARE_ACCOUNT_ID
    CLOUDFLARE_ZONE_ID

Cloudflare dashboard rule configuration is not a substitute for validating Turnstile tokens in server code.

### Analytics

    NEXT_PUBLIC_GA_MEASUREMENT_ID

### Optional Redis

    REDIS_URL
    UPSTASH_REDIS_REST_URL
    UPSTASH_REDIS_REST_TOKEN

Do not add Redis until a concrete cache or distributed-rate-limit requirement exists.

## 7. Root workspace setup

Create the workspace packages and standardize the scripts before wiring providers.

Required root tools:

- pnpm.
- turbo.
- TypeScript.
- Zod.
- ESLint and Prettier.

Required Turbo tasks:

- dev
- build
- typecheck
- lint
- test
- test:integration

Every package should have:

- A private package name under the @eshanika scope.
- An explicit exports map.
- A source entrypoint.
- A typecheck script.
- No accidental dependency on either app.

Recommended dependency direction:

    types and validation
             ↓
            env
             ↓
    auth, db, email, messaging, storage,
    payments, workflows, security
             ↓
       apps/store and apps/admin adapters

Provider packages must not import app UI code.

## 8. Neon PostgreSQL and Drizzle setup

### Neon project setup

1. Create separate staging and production Neon projects, or an explicitly isolated staging branch and production branch.
2. Record each project and branch identifier.
3. Create a pooled runtime connection for DATABASE_URL.
4. Keep an unpooled connection in DATABASE_URL_UNPOOLED for trusted administrative and local database tasks only.
5. Require TLS and keep production credentials out of local development.
6. Document branch ownership and how a preview branch is created and deleted.
7. Do not import WordPress data during this service phase.

### Drizzle package setup

Install in packages/db:

    drizzle-orm
    @neondatabase/serverless

Install as a development dependency:

    drizzle-kit

Create:

- packages/db/src/client.ts
- packages/db/src/health.ts
- packages/db/drizzle.config.ts

The connection module must:

- Read DATABASE_URL only from packages/env.
- Use the Neon HTTP driver for ordinary application requests and expose a
  bounded Neon `Pool` plus `close()` for interactive transactions and tests.
- Use the Neon HTTP driver for ordinary serverless request/response queries.
- Use the Neon WebSocket driver when an interactive transaction is required.
- Avoid creating an unbounded number of clients in serverless requests.
- Close pooled WebSocket connections in the same request lifecycle on Vercel;
  do not cache them across serverless requests.
- Expose close/dispose behavior for tests.
- Never export the raw database password.

Better Auth will receive the Drizzle database instance from packages/db through the official Better Auth Drizzle adapter. Keep packages/db independent of packages/auth so the dependency direction remains one-way.

### Better Auth schema handoff

The generated auth schema lives in `packages/db/src/schema/auth.ts` and is
re-exported by `packages/db/src/schema/index.ts`. Regenerate it after changing the
Better Auth plugins with:

    pnpm dlx auth@latest generate --adapter drizzle --dialect postgresql \
      --config packages/auth/cli-config.ts \
      --output packages/db/src/schema/auth.ts --yes

This setup plan does not apply production migrations and does not create
product, order, customer, payment, or invoice tables.

Service-only verification:

1. Run a SELECT 1 health check against staging.
2. Run a typecheck through Turbo.
3. Run one transaction test against a disposable test table or test database.
4. Confirm the production connection is not used by local development.

## 9. Better Auth setup

### Package setup

Install in packages/auth:

    better-auth
    @better-auth/drizzle-adapter

Create:

- packages/auth/src/auth.ts
- packages/auth/src/client.ts
- packages/auth/src/server.ts
- packages/auth/src/next.ts
- packages/auth/cli-config.ts
- apps/store/src/app/api/auth/[...all]/route.ts and apps/admin/src/app/api/auth/[...all]/route.ts

Configure the Better Auth server instance with:

- BETTER_AUTH_SECRET with at least 32 characters and high entropy;
- BETTER_AUTH_URL;
- trusted origins for localhost, staging, and production;
- the Drizzle adapter with provider pg;
- the Neon-backed Drizzle client from packages/db;
- the generated Better Auth schema;
- an explicit app name;
- secure cookies in staging/production.

When using the Drizzle adapter, prefer better-auth/minimal when supported by the installed version to reduce the server bundle. Use the import path documented for the installed Better Auth version.

The Next.js route adapter should use Better Auth's Next.js handler and export only the required GET and POST methods. It must not contain authentication business rules.

### Phone login and second factor

The initial user authentication flow is Better Auth phone-number authentication:

1. The user submits an E.164 phone number.
2. Better Auth's phoneNumber plugin generates and stores the verification challenge.
3. Better Auth calls its sendOTP callback with the phone number and code.
4. packages/messaging sends the supplied code through 2Factor.
5. The user submits the code to Better Auth.
6. Better Auth verifies the code and creates the session.

Phone OTP login is authentication, not a second authentication factor. If a true second factor is required later, add Better Auth's twoFactor plugin. Its OTP option can reuse the same 2Factor sendOTP adapter, while TOTP avoids SMS delivery for the second factor.

### Auth package checks

Implement and test:

- createAuthClient;
- server session retrieval;
- requireAuthenticatedUser;
- phoneNumber plugin request and verification;
- safe sign-out;
- trusted-origin rejection;
- secure cookie behavior;
- unauthenticated request rejection.

No UI screens are part of this setup plan.

### Auth schema handoff

Generate the Better Auth Drizzle schema for the core user, session, account, and verification tables, plus the phoneNumber plugin fields. If the twoFactor plugin is enabled, include its table and user field as well. The user will apply the resulting migration with the rest of the database work.

## 10. 2Factor.in through Better Auth

### Why this service exists

Better Auth owns OTP generation, expiry, attempt handling, and verification. 2Factor is the delivery provider. There is no separate external hook or Edge Function in this architecture.

### Provider setup

1. Create a 2Factor account.
2. Create or select an approved sender ID.
3. Register the exact OTP message as an Indian DLT template.
4. Record the approved template name/ID.
5. Create a staging API key.
6. Create a production API key only after staging delivery is verified.
7. Confirm India TRAI/DLT restrictions and sender/template matching.

### Better Auth sendOTP integration

The Better Auth phoneNumber plugin receives a sendOTP callback with:

- phoneNumber;
- code;
- request context.

The callback should call packages/messaging. The 2Factor adapter must:

1. Validate the E.164 phone number and six-digit code.
2. Use the configured DLT template and sender.
3. Send the code over HTTPS.
4. Return success only after the provider accepts the message.
5. Return a safe error without exposing the code or API key.
6. Emit a redacted correlation ID for troubleshooting.

Do not enqueue the actual OTP send in Inngest. The Better Auth request must receive the provider result directly because the user is waiting for the code.

### Phone/WhatsApp decision

For the initial setup, use SMS OTP through 2Factor. WhatsApp authentication can be added later if the Meta WhatsApp Business setup and approved template are available. Keep the messaging interface channel-neutral so the later WhatsApp adapter does not change Better Auth integration.

### OTP smoke test

Test only with a controlled staging number:

- request OTP;
- receive the message;
- verify the OTP through Better Auth;
- verify an invalid OTP fails;
- verify an expired OTP fails;
- verify resend throttling;
- verify the Better Auth phone-number attempt limit;
- verify provider timeout returns a safe error;
- verify the code is never logged.

## 11. Resend email setup

### Account and domain

1. Create a Resend account.
2. Add the production sending domain.
3. Add a separate staging sender/subdomain if possible.
4. Publish the required SPF and DKIM records.
5. Add a DMARC policy appropriate for the domain.
6. Create separate staging and production API keys.
7. Verify the from address.

### Package setup

The packages/email client should:

- accept a typed recipient, subject, template, and variables;
- use the configured sender;
- attach a request/correlation ID;
- return a provider-neutral message ID;
- classify retryable and permanent failures;
- use a fake adapter in tests.

Start with one plain service-test email. Add customer-facing templates later with the application work.

### Email ownership

Choose one owner for each category:

| Email category                        | Suggested owner                                      |
| ------------------------------------- | ---------------------------------------------------- |
| Better Auth verification/reset emails | Better Auth email callbacks backed by packages/email |
| Order/payment/shipping emails         | Resend                                               |
| Operational alerts                    | Resend or the hosting/platform alerting system       |
| Marketing/newsletters                 | A dedicated consent-aware marketing provider later   |

Do not send the same Better Auth email through both a default sender and Resend.

## 12. Cloudflare R2 setup

### Buckets

Create separate staging and production buckets:

- public media bucket for product images and non-sensitive assets;
- private documents bucket for invoices and other protected files.

Suggested bucket names:

    eshanika-media-staging
    eshanika-private-staging
    eshanika-media-production
    eshanika-private-production

### Credentials

1. Create an R2 API token with the minimum bucket permissions.
2. Use separate staging and production tokens.
3. Give public-media automation only the permissions it needs.
4. Keep private-document access server-only.
5. Never expose S3-compatible access keys to the browser.

### Better Upload setup

Better Upload is the upload layer for R2. It creates pre-signed upload URLs on the server and lets the browser upload directly to the S3-compatible R2 bucket. This keeps file bytes off the Next.js server while preserving server-side authentication and validation.

Reference:

- [Better Upload documentation](https://better-upload.com/docs)
- [Better Upload quickstart](https://better-upload.com/docs/quickstart)
- [Better Upload upload routes](https://better-upload.com/docs/routes-multiple)
- [Better Upload client hooks](https://better-upload.com/docs/hooks-multiple)

Install in packages/storage:

    @better-upload/server
    @better-upload/client
    @aws-sdk/client-s3
    @aws-sdk/s3-request-presigner

Create:

- packages/storage/src/better-upload-router.ts
- apps/admin/src/app/api/upload/route.ts

The storage package owns the Better Upload router and route definitions. The Next.js file is a thin adapter using Better Upload's Next.js route handler. The adapter must not contain provider rules or credentials.

Configure at least two upload routes:

| Route            | Bucket                      | Allowed content                                 | Access                                  |
| ---------------- | --------------------------- | ----------------------------------------------- | --------------------------------------- |
| public-media     | R2 public media bucket      | Product images and approved non-sensitive media | Authenticated operator/admin flow later |
| private-document | R2 private documents bucket | PDF and approved document types                 | Authenticated server-authorized flow    |

For each route:

- Validate the authenticated user and authorization role in the before-upload callback.
- Validate file count, MIME type, extension, and maximum size.
- Validate client metadata with a schema.
- Generate a controlled object key from server-side values.
- Never use an arbitrary client-supplied path as the object key.
- Set a short pre-signed URL expiration.
- Return only the metadata needed by the client.
- Reject before issuing a URL when validation fails.

Use Better Upload's route callbacks for authorization, rate limiting, object-key generation, and metadata. Use its client hook for progress and completion state in the future UI; no upload UI is implemented in this setup phase.

### Storage package responsibilities

Implement:

- Better Upload R2 client and router;
- putObject for trusted server-side jobs;
- getObject metadata;
- deleteObject;
- createSignedDownloadUrl;
- publicUrl;
- content-type and size validation;
- fake storage adapter;
- public/private bucket separation tests.

### URL and access rules

- Attach a custom media hostname to the public bucket.
- Use short-lived signed URLs for private objects.
- Restrict upload MIME types and maximum sizes.
- Do not allow arbitrary user-controlled object keys.
- Separate original, optimized, and private object prefixes.
- Configure CORS only for the required application origins.

The service setup should test one small staging upload through Better Upload and one signed private download. It should not upload the WordPress media library.

## 13. Razorpay setup

### Account setup

1. Create or use the Razorpay account.
2. Enable test mode.
3. Record test key ID and secret.
4. Configure a staging webhook endpoint.
5. Subscribe only to events needed by the future application.
6. Set a webhook secret.
7. Verify test signatures.
8. Repeat with live credentials only during production launch preparation.

### Package setup

Install in packages/payments:

    razorpay

Implement provider-neutral functions for:

- createPaymentOrder;
- verifyCheckoutSignature;
- verifyWebhookSignature;
- parseWebhookEvent;
- classifyPaymentStatus.

The package must:

- run only on the server;
- validate amounts and currency;
- use constant-time signature comparisons where applicable;
- treat webhooks as repeatable;
- expose an idempotency contract;
- never log full payment payloads or secrets.

The Next.js webhook route is only an adapter. It should verify the signature and pass a normalized event to the payments package. Actual order-state behavior is intentionally deferred.

### Cloudflare rule

Do not put Turnstile on a Razorpay webhook. Configure a precise WAF/rate-limit exception so a valid provider callback can reach the endpoint, while still validating the Razorpay signature in application code.

## 14. Inngest setup

### What Inngest is used for

Inngest is a durable event and workflow service. It runs functions asynchronously, retries transient failures, and supports delayed or scheduled work while retaining execution traces.

For this project it is suitable for:

- sending order confirmation email after a successful order;
- retrying notification delivery;
- payment reconciliation;
- delayed abandoned-cart reminders;
- inventory synchronization;
- periodic operational checks;
- processing non-critical audit or analytics events.

It is not suitable for:

- immediate OTP delivery;
- the request that must synchronously return a payment order;
- Razorpay signature verification;
- authorization decisions;
- anything that must complete before the HTTP response.

### Package and route setup

Install in packages/workflows:

    inngest

Create:

- a typed Inngest client;
- an event catalog;
- a local service-ping function;
- a function registration list;
- retry and concurrency defaults;
- redacted structured logging.

The Next.js route at apps/store/src/app/api/inngest/route.ts should only expose the registered functions to Inngest. Keep function definitions in packages/workflows.

### Execution budgeting

Inngest Hobby includes 50,000 executions per month. A function run and each step count as executions. For example, 30,000 workflow runs with two steps each can consume about 90,000 executions. A simple single-step event for an email or audit action consumes much less.

Add an alert before the quota and define a fallback for non-critical work. Do not allow an exhausted workflow quota to block checkout or login.

### Inngest setup test

- register the staging app;
- expose the staging route;
- send a service-ping event;
- confirm the function runs;
- force a controlled retry;
- confirm the event and step trace is visible;
- confirm secrets are not present in the trace.

## 15. Cloudflare DNS, CDN, and protection

### DNS and proxy

1. Add the domain to Cloudflare.
2. Move nameservers only during the agreed DNS change window.
3. Proxy web traffic through Cloudflare.
4. Use Full (strict) TLS.
5. Enable automatic HTTPS rewrites and HSTS only after HTTPS is verified.
6. Keep provider webhook hostnames and origin details documented.

### Turnstile

Create separate staging and production widgets. Use Turnstile on:

- login/OTP request abuse-sensitive forms;
- account recovery;
- contact or review forms;
- other anonymous high-abuse actions.

The server must call the Turnstile verification endpoint and validate:

- success;
- hostname;
- action;
- token age/one-time use;
- expected environment.

### Bot Fight Mode

Enable Cloudflare Bot Fight Mode at the zone level after checking staging behavior. Monitor false positives on:

- product pages;
- search;
- checkout;
- payment return URLs;
- Razorpay webhooks;
- legitimate crawlers needed for SEO.

### WAF and rate limiting

Start with narrow rules:

- rate-limit OTP request endpoints;
- rate-limit login and account recovery;
- rate-limit public search and contact endpoints;
- protect admin paths;
- block clearly malicious traffic;
- leave Razorpay callbacks protected by signature verification rather than a browser challenge.

Keep a documented rule order and test each rule in staging. Review the active account limits before adding additional WAF or rate-limit rules.

## 16. Analytics setup

### GA4

GA4 is optional. If enabled:

- create separate staging and production data streams;
- define a small event allowlist;
- do not send phone numbers, email addresses, addresses, or payment secrets;
- add consent handling before production tracking;
- keep payment success measurement independent from client-only events.

## 17. Service smoke-test matrix

| Service             | Test                                    | Expected result                            |
| ------------------- | --------------------------------------- | ------------------------------------------ |
| Neon DB             | SELECT 1 through packages/db            | Healthy connection                         |
| Drizzle             | Typed query against staging test object | Correct result and clean close             |
| Better Auth         | Create/refresh/sign out test session    | Session lifecycle works                    |
| 2Factor integration | Request and verify staging OTP          | Delivered OTP verifies through Better Auth |
| Resend              | Send a staging test email               | Message ID returned and mail received      |
| R2 public           | Upload a small non-sensitive object     | Public URL works                           |
| R2 private          | Create signed URL                       | Private object is not publicly readable    |
| Razorpay            | Create test payment order               | Test order ID returned                     |
| Razorpay webhook    | Send signed test callback               | Signature is accepted exactly once         |
| Inngest             | Send service-ping event                 | Function and trace complete                |
| Turnstile           | Verify valid and invalid tokens         | Valid passes; invalid fails                |
| Cloudflare          | Exercise staging WAF/rate limit         | Intended requests pass; abuse is limited   |

All tests must use staging credentials and test data.

## 18. Provider adapter and failure rules

Each provider package should expose a provider-neutral interface and a real implementation. Tests should use fakes.

Required failure categories:

- invalid input;
- authentication/authorization failure;
- provider timeout;
- provider rate limit;
- provider server error;
- duplicate callback/event;
- permanent validation failure;
- configuration missing;
- quota exhausted.

For every provider call, record:

- provider name;
- operation name;
- correlation ID;
- safe provider request/event ID;
- latency;
- result category.

Never record:

- OTP values;
- API keys;
- authorization headers;
- full payment signatures;
- full customer addresses;
- full phone numbers or email addresses.

## 19. Deployment and secret promotion

### Staging

1. Create staging service resources.
2. Add staging secrets to the deployment platform.
3. Deploy packages and thin route adapters.
4. Configure staging callback URLs.
5. Run the smoke-test matrix.
6. Review application logs, WAF events, and provider dashboards.

### Production

1. Create production resources with separate credentials.
2. Verify domains and DNS records.
3. Configure production Better Auth URL, trusted origins, and auth route.
4. Configure production Resend sender and DNS authentication.
5. Configure production R2 domains and bucket permissions.
6. Configure Razorpay live webhook and live credentials.
7. Configure the production Inngest app.
8. Configure Turnstile production hostname and Cloudflare rules.
9. Deploy with production environment variables.
10. Repeat the smoke tests using safe production health checks.

Do not copy staging secrets into production or commit any secret file.

## 20. Completion checklist

Service setup is complete when:

- The Turborepo package skeleton exists.
- Every package has a type-safe public boundary.
- Staging and production environment contracts are documented.
- Neon staging connects through Drizzle.
- Better Auth session helpers work.
- The 2Factor Better Auth callback delivers and verifies a staging OTP.
- Resend sends a verified-domain staging email.
- R2 public and private access tests pass.
- Razorpay test order and signed webhook tests pass.
- Inngest staging service-ping function runs and retries.
- Turnstile server verification works.
- Cloudflare DNS, Bot Fight Mode, WAF, and rate-limit rules are documented and tested in staging.
- Provider fakes exist for automated tests.
- Production secrets are separate from staging secrets.
- No WordPress data has been imported by this service setup.

## 21. Official references

- [Better Auth installation](https://better-auth.com/docs/installation)
- [Better Auth Drizzle adapter](https://better-auth.com/docs/adapters/drizzle)
- [Better Auth phone-number plugin](https://better-auth.com/docs/plugins/phone-number)
- [Better Auth two-factor plugin](https://better-auth.com/docs/plugins/2fa)
- [oRPC getting started](https://orpc.dev/docs/getting-started)
- [oRPC Next.js adapter](https://orpc.dev/docs/adapters/next)
- [oRPC TanStack Query integration](https://orpc.dev/docs/integrations/tanstack-query)
- [oRPC Better Auth integration](https://orpc.dev/docs/integrations/better-auth)
- [Better Upload quickstart](https://better-upload.com/docs/quickstart)
- [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver)
- [Vercel Pro plan](https://vercel.com/docs/plans/pro-plan)
- [Vercel terms](https://vercel.com/legal/terms)
- [Cloudflare Turnstile plans](https://developers.cloudflare.com/turnstile/plans/)
- [Cloudflare Bot Fight Mode](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/)
- [Cloudflare WAF custom rules](https://developers.cloudflare.com/waf/custom-rules/)
