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

const databaseUrl = new URL(resolveDatabaseUrl());

export const pool = new Pool({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 5432),
  user: databaseUrl.username,
  password: databaseUrl.password,
  database: databaseUrl.pathname.replace("/", ""),

  ssl: {
    rejectUnauthorized: false,
  },

  family: 4,
});

export const db = drizzle(pool, {
  schema,
});

export * from "./schema";
