import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_a4wb8qjGKQmO@ep-flat-fog-aheju0v8-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });
// Hardcoded Neon DB URL
