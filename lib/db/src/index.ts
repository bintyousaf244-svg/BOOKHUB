import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err) => {
  console.error("PG POOL ERROR:", err);
});

export const db = drizzle(pool, {
  schema,
});

(async () => {
  try {
    const client = await pool.connect();

    const result = await client.query(
      "SELECT NOW()"
    );

    console.log(
      "DATABASE CONNECTED:",
      result.rows
    );

    client.release();

  } catch (error) {
    console.error(
      "DATABASE CONNECTION FAILED:",
      error
    );
  }
})();

export * from "./schema";