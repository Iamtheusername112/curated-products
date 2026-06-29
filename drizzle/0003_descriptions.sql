ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "frontend_categories" ADD COLUMN IF NOT EXISTS "description" text;
