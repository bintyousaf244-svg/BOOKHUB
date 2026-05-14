console.log("FORCING IPV4 DATABASE CONNECTION");

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dns from "dns";
import * as schema from "./schema";

dns.setDefaultResultOrder("ipv4first");

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

const databaseUrl = new URL(process.env.DATABASE_URL);

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