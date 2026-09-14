# Admin

The Eshanika administration app. It runs on port 3000 in development and shares
UI, ESLint, and TypeScript configuration with the rest of the monorepo.

It exposes the Better Auth and oRPC routes and the authenticated Better Upload
adapter. Admin roles are intentionally deferred to the commerce phase.

```sh
pnpm --filter admin dev
```
