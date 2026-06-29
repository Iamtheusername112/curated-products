CREATE TABLE IF NOT EXISTS "site_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "key" text NOT NULL,
  "value" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);

CREATE TABLE IF NOT EXISTS "frontend_categories" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "display_name" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL,
  "cover_image_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "frontend_categories_slug_unique" UNIQUE("slug")
);

CREATE INDEX IF NOT EXISTS "frontend_categories_active_order_idx"
  ON "frontend_categories" ("is_active", "display_order");
