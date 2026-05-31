import pg from "pg";
import { config } from "../config.js";

export const pool = config.databaseUrl
  ? new pg.Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseUrl.includes("supabase")
        ? { rejectUnauthorized: false }
        : undefined
    })
  : undefined;

export async function checkDatabase() {
  if (!pool) {
    return {
      connected: false,
      mode: "local-json",
      message: "DATABASE_URL is not configured; using persistent local JSON storage."
    };
  }

  const client = await pool.connect();
  try {
    await client.query("select 1");
    return {
      connected: true,
      mode: "postgres",
      message: "PostgreSQL connection is healthy."
    };
  } finally {
    client.release();
  }
}
