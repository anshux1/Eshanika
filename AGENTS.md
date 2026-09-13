# Eshanika repository rules

## Project shape

- This is a pnpm 11 + Turborepo monorepo. Use Node.js 24 or newer.
- The only applications are `apps/admin` and `apps/store`.
- Shared code belongs in `packages/`; shared package names use the `@eshanika/*`
  scope.
- Keep one root `pnpm-workspace.yaml` and one root `pnpm-lock.yaml`. Do not add
  nested workspaces or app-level lockfiles.

## Shared configuration

- Every app and package should extend `@eshanika/typescript-config` rather than
  duplicating compiler defaults.
- Use `@eshanika/eslint-config/next-js` for Next.js apps and
  `@eshanika/eslint-config/react-internal` for React packages.
- ESLint uses flat config and the current ESLint major. Do not add legacy
  `.eslintrc*` files or use the removed `next lint` command.
- Prefer `*.config.ts` when the tool supports TypeScript config files. The
  Tailwind/PostCSS integration intentionally remains `postcss.config.mjs`, which
  is the supported Next.js setup.
- Keep workspace dependencies expressed as `workspace:*`.
- Build scripts are explicitly denied for `sharp` and `unrs-resolver` in the
  root pnpm policy; review that policy deliberately before enabling a new native
  dependency.

## Development workflow

- Install from the repository root with `pnpm install`.
- Use `pnpm dev`, or filter a single app with `pnpm --filter admin dev` or
  `pnpm --filter store dev`.
- Before handing off changes, run `pnpm lint`, `pnpm check-types`, and the
  relevant app/package build.
- Keep generated output (`.next`, `dist`, `build`, coverage, and TypeScript
  build-info files) out of commits.

## Code conventions

- Keep app routes under `src/app` and keep shared UI components in
  `packages/ui/src`.
- Prefer small, accessible React components and semantic HTML.
- Do not commit secrets or real environment values. Use `.env.example` for
  documented required variables.
- Update package manifests and the root lockfile together when dependencies
  change.
- Avoid unrelated rewrites when changing an app or shared package.
