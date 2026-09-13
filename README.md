# Eshanika

Eshanika is a pnpm + Turborepo monorepo containing the storefront, admin app, and
shared packages used by both.

## Workspace

- `apps/store` — customer-facing storefront on port 3001
- `apps/admin` — administration app on port 3000
- `packages/ui` — shared React UI components published internally as `@eshanika/ui`
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

Read [AGENT.md](./AGENT.md) before changing repository structure or tooling.
