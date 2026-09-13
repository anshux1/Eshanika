# `@eshanika/env`

Shared environment-validation dependencies for the Eshanika Next.js apps.

The package exposes T3 Env's `createEnv` function and the Zod namespace so each
app can define its own server and client schema without duplicating dependency
configuration:

```ts
import { createEnv, z } from "@eshanika/env";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {},
  experimental__runtimeEnv: process.env,
});
```

Import the app's `src/env.ts` from `next.config.ts` so invalid values fail the
build early. Add future server-only variables to `server`, and expose browser
variables only through `client` with the `NEXT_PUBLIC_` prefix.
