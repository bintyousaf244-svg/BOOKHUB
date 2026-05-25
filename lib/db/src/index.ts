console.log("FORCING IPV4 DATABASE CONNECTION");

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dns from "dns";
import * as schema from "./schema";

dns.setDefaultResultOrder("ipv4first");

const { Pool } = pg;

function resolveDatabaseUrl(): string {
  const rawValue = process.env.DATABASE_URL?.trim();

  if (!rawValue) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?"
    );
  }

  if (rawValue.startsWith("DATABASE_URL=")) {
    return rawValue.slice("DATABASE_URL=".length);
  }

  return rawValue;
}

const resolvedDatabaseUrl = resolveDatabaseUrl();
const databaseUrl = new URL(resolvedDatabaseUrl);

export const pool = new Pool({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 5432),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: decodeURIComponent(databaseUrl.pathname.replace(/^\//, "")),

  ssl: {
    rejectUnauthorized: false,
  },

  family: 4,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
} as any);

export const db = drizzle(pool, {
  schema,
});

export * from "./schema";
