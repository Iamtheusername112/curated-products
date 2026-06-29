import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnvLocal() {
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS "product_images" (
    "id" serial PRIMARY KEY NOT NULL,
    "product_id" integer NOT NULL REFERENCES "products"("id") ON DELETE cascade,
    "image_url" text NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS "product_images_product_id_idx"
  ON "product_images" ("product_id")
`;

const backfilled = await sql`
  INSERT INTO "product_images" ("product_id", "image_url", "sort_order")
  SELECT p.id, p.image_url, 0
  FROM "products" p
  WHERE p.image_url LIKE '/uploads/%'
    AND NOT EXISTS (
      SELECT 1 FROM "product_images" pi WHERE pi.product_id = p.id
    )
  RETURNING id
`;

console.log(`product_images table ready. Backfilled ${backfilled.length} rows.`);
