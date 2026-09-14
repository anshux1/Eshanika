# Coolify deployment

Coolify can run the same two apps from the monorepo after the initial Vercel
deployment. Create one application for `store` and one for `admin`, both with
the repository root as the base directory.

For each application:

- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm --filter <app> build`
- Start command: `pnpm --filter <app> start`
- Node version: 24 or newer.
- Health path: `/`.

Replace `<app>` with `store` or `admin`. Add the same environment names used on
Vercel, but use Coolify's staging/production secrets separately. Keep Neon,
R2, Razorpay, Better Auth, and Inngest callback URLs pointed at the active
Coolify domains. No provider package or route code needs to change for this
move.
