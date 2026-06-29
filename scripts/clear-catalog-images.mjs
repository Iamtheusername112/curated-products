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
const PLACEHOLDER = "/images/no-product-image.svg";

const products = await sql`
  UPDATE products
  SET image_url = ${PLACEHOLDER}, updated_at = NOW()
  WHERE image_url NOT LIKE '/uploads/%'
  RETURNING id, title
`;

const categories = await sql`
  UPDATE frontend_categories
  SET cover_image_url = NULL
  WHERE cover_image_url IS NOT NULL
  RETURNING slug
`;

console.log(`Cleared images on ${products.length} products`);
console.log(`Cleared cover images on ${categories.length} categories`);

if (products.length > 0) {
  console.log("Sample:", products.slice(0, 5));
}
