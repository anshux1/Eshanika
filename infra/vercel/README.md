# Vercel deployment

Create two Vercel projects from the same repository:

| Project | Build command               | Start          | Public port  |
| ------- | --------------------------- | -------------- | ------------ |
| Store   | `pnpm --filter store build` | Vercel-managed | 3001 locally |
| Admin   | `pnpm --filter admin build` | Vercel-managed | 3000 locally |

Use the repository root as the project root so pnpm can use the single root
lockfile. Add the relevant environment variables from `.env.example` to each
project, with separate preview/staging and production values.

Configure these callback paths after the first deployment:

- Better Auth: `/api/auth/*` on each app.
- oRPC: `/api/rpc` on each app.
- Razorpay: `/api/payments/razorpay/webhook` on the store.
- Inngest: `/api/inngest` on the store.
- Better Upload: `/api/upload` on the admin app.
