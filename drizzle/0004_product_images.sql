CREATE TABLE IF NOT EXISTS "product_images" (
  "id" serial PRIMARY KEY NOT NULL,
  "product_id" integer NOT NULL REFERENCES "products"("id") ON DELETE cascade,
  "image_url" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "product_images_product_id_idx" ON "product_images" ("product_id");

INSERT INTO "product_images" ("product_id", "image_url", "sort_order")
SELECT p.id, p.image_url, 0
FROM "products" p
WHERE p.image_url LIKE '/uploads/%'
  AND NOT EXISTS (
    SELECT 1 FROM "product_images" pi WHERE pi.product_id = p.id
  );
