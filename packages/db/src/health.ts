import type { ProviderHealth } from "@eshanika/types";

import type {
  HttpDatabaseConnection,
  PooledDatabaseConnection,
} from "./client.ts";

export async function checkDatabase(
  connection: HttpDatabaseConnection | PooledDatabaseConnection,
): Promise<ProviderHealth> {
  try {
    if (connection.mode === "pooled") {
      await connection.pool.query("select 1");
    } else {
      await connection.sql`select 1`;
    }

    return {
      provider: "neon",
      status: "healthy",
      checkedAt: new Date().toISOString(),
    };
  } catch {
    return {
      provider: "neon",
      status: "unhealthy",
      checkedAt: new Date().toISOString(),
    };
  }
}
