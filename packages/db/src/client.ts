import "server-only";

import { neon, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzlePooled } from "drizzle-orm/neon-serverless";

import { getServerEnv } from "@eshanika/env/server";

export interface DatabasePoolOptions {
  readonly max?: number;
  readonly idleTimeoutMillis?: number;
  readonly maxLifetimeSeconds?: number;
}

function requiredDatabaseUrl(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  return databaseUrl;
}

function createHttpDb(databaseUrl = getServerEnv().DATABASE_URL) {
  const connectionString = requiredDatabaseUrl(databaseUrl);
  const sql = neon(connectionString);

  return {
    mode: "http" as const,
    db: drizzleHttp({ client: sql }),
    sql,
    close: async () => undefined,
  };
}

export type HttpDatabaseConnection = ReturnType<typeof createHttpDb>;

function createPooledDb(
  databaseUrl = getServerEnv().DATABASE_URL,
  options: DatabasePoolOptions = {},
) {
  const pool = new Pool({
    connectionString: requiredDatabaseUrl(databaseUrl),
    max: options.max ?? 5,
    idleTimeoutMillis: options.idleTimeoutMillis ?? 10_000,
    maxLifetimeSeconds: options.maxLifetimeSeconds ?? 300,
    allowExitOnIdle: true,
  });

  return {
    mode: "pooled" as const,
    db: drizzlePooled(pool),
    pool,
    close: () => pool.end(),
  };
}

export type PooledDatabaseConnection = ReturnType<typeof createPooledDb>;

// Normal Next.js requests use HTTP, which is safe for Vercel serverless
// lifecycles. Use withPooledDb for interactive transactions.
export type DatabaseConnection = HttpDatabaseConnection;

export async function withPooledDb<T>(
  callback: (connection: PooledDatabaseConnection) => Promise<T>,
  databaseUrl = getServerEnv().DATABASE_URL,
  options?: DatabasePoolOptions,
): Promise<T> {
  const connection = createPooledDb(databaseUrl, options);

  try {
    return await callback(connection);
  } finally {
    await connection.close();
  }
}

let cachedConnection: DatabaseConnection | undefined;

export function getDb(databaseUrl = getServerEnv().DATABASE_URL) {
  cachedConnection ??= createHttpDb(databaseUrl);
  return cachedConnection;
}
