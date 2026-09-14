import { createEnv } from "@eshanika/env";
import { clientEnvSchema } from "@eshanika/env/client";
import { serverEnvSchema } from "@eshanika/env/server";

export const env = createEnv({
  server: serverEnvSchema,
  client: clientEnvSchema,
  experimental__runtimeEnv: process.env as unknown as Record<
    keyof typeof clientEnvSchema,
    string | undefined
  >,
  emptyStringAsUndefined: true,
});
