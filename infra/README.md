# Infrastructure setup

This repository has two Next.js apps and one shared service layer:

- `apps/store` — customer-facing app and payment/Inngest adapters.
- `apps/admin` — admin app and authenticated Better Upload adapter.
- `packages/*` — provider clients and reusable server boundaries.

## Local setup

1. Copy `.env.example` to `apps/store/.env.local` and
   `apps/admin/.env.local`; fill in only the services each app uses.
   Set each app's `APP_URL`, `BETTER_AUTH_URL`, and `NEXT_PUBLIC_APP_URL` to
   its own local URL.
2. Create a Neon database and set `DATABASE_URL` to its pooled runtime URL.
3. Set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and trusted origins for the
   store and admin URLs.
4. Configure 2Factor with the approved DLT template and sender when phone OTP
   is enabled.
5. Verify a Resend sender/domain before sending application email.
6. Create separate public-media and private-document R2 buckets and a token
   limited to those buckets.
7. Use Razorpay test credentials for the store webhook during development.
8. Run the Inngest dev server locally when testing durable functions.

The Better Auth routes are available at `/api/auth/*` in both apps. The shared
oRPC endpoint is `/api/rpc`; the admin upload endpoint is `/api/upload` and the
store payment/Inngest endpoints are documented below.

## Deployment order

Start with separate Vercel projects for `apps/store` and `apps/admin`. Keep
preview/staging and production environment values separate. When moving to
Coolify, deploy the same two apps from the repository root using the commands
in `infra/coolify/README.md`; the package boundaries and environment contract
do not change.

See the provider-specific notes:

- `infra/neon/README.md`
- `infra/cloudflare/README.md`
- `infra/vercel/README.md`
- `infra/coolify/README.md`

Never commit `.env.local`, provider tokens, database URLs, or production data.
