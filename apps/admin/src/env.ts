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
