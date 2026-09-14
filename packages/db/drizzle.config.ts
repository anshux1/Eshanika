import { getServerEnv } from "@eshanika/env/server";
import { defineConfig } from "drizzle-kit";

const env = getServerEnv();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL ?? "",
  },
});
