ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "audience" text DEFAULT 'women' NOT NULL;

CREATE INDEX IF NOT EXISTS "products_category_audience_idx"
  ON "products" ("category", "audience");
