import { neon } from "@neondatabase/serverless";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "clerk_user_id" text NOT NULL,
    "email" text,
    "first_name" text,
    "last_name" text,
    "image_url" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
  )
`;

await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS "users_clerk_user_id_idx"
  ON "users" ("clerk_user_id")
`;

console.log("Users table migration complete.");
