CREATE TABLE IF NOT EXISTS "products" (
  "id" serial PRIMARY KEY NOT NULL,
  "shein_product_id" text NOT NULL,
  "title" text NOT NULL,
  "image_url" text NOT NULL,
  "current_price" numeric(10, 2),
  "original_price" numeric(10, 2),
  "raw_product_url" text,
  "affiliate_url" text NOT NULL,
  "category" text,
  "is_trending" boolean DEFAULT false NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "products_shein_product_id_idx" ON "products" USING btree ("shein_product_id");
CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products" USING btree ("category");

CREATE TABLE IF NOT EXISTS "user_watchlist" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "product_id" integer NOT NULL,
  "target_price" numeric(10, 2),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "user_watchlist_user_id_idx" ON "user_watchlist" USING btree ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "user_watchlist_user_product_idx" ON "user_watchlist" USING btree ("user_id", "product_id");

DO $$ BEGIN
  ALTER TABLE "user_watchlist" ADD CONSTRAINT "user_watchlist_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
