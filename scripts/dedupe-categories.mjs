import { neon } from "@neondatabase/serverless";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const sql = neon(process.env.DATABASE_URL);

const rows = await sql`
  SELECT id, slug
  FROM frontend_categories
  ORDER BY slug, id
`;

const keepIds = new Set();
const seenSlugs = new Set();

for (const row of rows) {
  if (!seenSlugs.has(row.slug)) {
    seenSlugs.add(row.slug);
    keepIds.add(row.id);
  }
}

const deleteIds = rows.map((row) => row.id).filter((id) => !keepIds.has(id));

if (deleteIds.length === 0) {
  console.log("No duplicate categories to remove.");
} else {
  await sql`DELETE FROM frontend_categories WHERE id = ANY(${deleteIds})`;
  console.log(`Removed ${deleteIds.length} duplicate category row(s).`);
}

try {
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS frontend_categories_slug_idx
    ON frontend_categories (slug)
  `;
  console.log("Unique index on slug ensured.");
} catch (error) {
  console.warn("Could not create unique index:", error);
}

console.log("Done.");
