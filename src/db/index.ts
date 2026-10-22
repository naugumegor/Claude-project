import "server-only";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import * as schema from "./schema";

// Neon in production (DATABASE_URL is set by the Vercel integration).
// Locally, without DATABASE_URL, an embedded Postgres (PGlite) stored in .data/.
function createDb() {
  const url = process.env.DATABASE_URL;
  if (url) return drizzleNeon(url, { schema });
  if (process.env.VERCEL) throw new Error("DATABASE_URL is not set. Connect Neon in Vercel.");
  return drizzlePglite(process.env.PGLITE_DIR ?? ".data/pglite", { schema });
}

type Db = ReturnType<typeof createDb>;

// One client per process, shared by every bundle (pages, actions, route handlers).
// PGlite especially must not be opened twice: each copy would see its own stale data.
const globalForDb = globalThis as unknown as { db?: Db };

export const db: Db = (globalForDb.db ??= createDb());
