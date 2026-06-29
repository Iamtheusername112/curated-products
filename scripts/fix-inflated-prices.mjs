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

const rows = await sql`
  SELECT id, title, current_price, original_price
  FROM products
  WHERE current_price IS NOT NULL
    AND current_price::numeric >= 50
`;

const updates = [];

for (const row of rows) {
  const current = Number.parseFloat(row.current_price);
  const fixedCurrent = (current / 100).toFixed(2);
  let fixedOriginal = row.original_price;

  if (row.original_price) {
    const original = Number.parseFloat(row.original_price);
    if (original >= 50) {
      fixedOriginal = (original / 100).toFixed(2);
    }
  }

  if (Number.parseFloat(fixedCurrent) < current) {
    updates.push({
      id: row.id,
      title: row.title,
      from: row.current_price,
      to: fixedCurrent,
    });

    await sql`
      UPDATE products
      SET
        current_price = ${fixedCurrent},
        original_price = ${fixedOriginal},
        updated_at = NOW()
      WHERE id = ${row.id}
    `;
  }
}

console.log(`Fixed ${updates.length} inflated prices (divided by 100)`);
if (updates.length > 0) {
  console.log(updates.slice(0, 10));
}
