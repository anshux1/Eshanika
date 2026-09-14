# Eshanika

Eshanika is a pnpm + Turborepo monorepo containing the storefront, admin app, and
shared packages used by both.

## Workspace

- `apps/store` — customer-facing storefront on port 3001
- `apps/admin` — administration app on port 3000
- `packages/api` — typed oRPC router, fetch handler, and TanStack Query utils
- `packages/auth` — Better Auth server/client and Next.js adapter
- `packages/db` — Neon pooled/HTTP + Drizzle connection boundary
- `packages/messaging` — 2Factor OTP delivery adapter
- `packages/email` — Resend email boundary
- `packages/storage` — R2 signing helpers and Better Upload router
- `packages/payments` — Razorpay client, signatures, and webhook parsing
- `packages/workflows` — Inngest client, events, and functions
- `packages/security` — Turnstile and request-signature helpers
- `packages/ui` — shared React UI components published internally as `@eshanika/ui`
- `packages/env` — shared T3 Env and Zod setup for typed environment validation
- `packages/eslint-config` — shared ESLint 10 flat configurations
- `packages/typescript-config` — shared TypeScript compiler presets

The apps consume shared packages with `workspace:*` dependencies. There is one
workspace and one lockfile at the repository root.

## Commands

```sh
pnpm install
pnpm dev
pnpm lint
pnpm check-types
pnpm build
pnpm format
```

Run one app with a filter:

```sh
pnpm --filter admin dev
pnpm --filter store dev
```

Read [AGENTS.md](./AGENTS.md) before changing repository structure or tooling.

The setup boundary is documented in [SETUP_PLAN.md](./SETUP_PLAN.md), with
provider deployment notes in [infra/README.md](./infra/README.md).
