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

const tables = await sql`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('user_watchlist', 'products', 'users')
`;

console.log("Tables:", tables.map((row) => row.table_name));

const [{ c }] = await sql`SELECT COUNT(*)::int AS c FROM user_watchlist`;
console.log("Watchlist row count:", c);

const sample = await sql`
  SELECT id, user_id, product_id, created_at
  FROM user_watchlist
  ORDER BY id DESC
  LIMIT 5
`;
console.log("Recent watchlist rows:", sample);

const product = await sql`SELECT id, title FROM products WHERE id = 27`;
console.log("Product 27:", product);

const users = await sql`SELECT clerk_user_id, email FROM users LIMIT 5`;
console.log("Users:", users);

const joined = await sql`
  SELECT w.id, w.user_id, w.product_id, p.title
  FROM user_watchlist w
  LEFT JOIN products p ON p.id = w.product_id
`;
console.log("Watchlist join:", joined);
