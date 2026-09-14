# `@eshanika/env`

Shared T3 Env schemas for the two Next.js applications. Provider values are
optional here until the matching service is provisioned.

Applications compose the schemas in `src/env.ts` and import that file from
`next.config.ts`, so invalid values fail during the build. Only the variables
exported from `@eshanika/env/client` may be used in browser code.
