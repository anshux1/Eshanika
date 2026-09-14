# Store

The Eshanika customer storefront. It runs on port 3001 in development and shares
UI, ESLint, and TypeScript configuration with the rest of the monorepo.

It exposes the Better Auth and oRPC routes plus the Razorpay webhook and
Inngest adapters.

```sh
pnpm --filter store dev
```
