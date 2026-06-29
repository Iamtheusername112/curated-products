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
  ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "audience" text DEFAULT 'women' NOT NULL
`;

await sql`
  CREATE INDEX IF NOT EXISTS "products_category_audience_idx"
  ON "products" ("category", "audience")
`;

console.log("products.audience column ready.");
