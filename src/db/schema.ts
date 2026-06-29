import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    sheinProductId: text("shein_product_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url").notNull(),
    currentPrice: numeric("current_price", { precision: 10, scale: 2 }),
    originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
    rawProductUrl: text("raw_product_url"),
    affiliateUrl: text("affiliate_url").notNull(),
    category: text("category"),
    audience: text("audience").default("women").notNull(),
    isTrending: boolean("is_trending").default(false).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("products_shein_product_id_idx").on(table.sheinProductId),
    index("products_category_idx").on(table.category),
    index("products_category_audience_idx").on(table.category, table.audience),
  ]
);

export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("product_images_product_id_idx").on(table.productId)]
);

export const userWatchlist = pgTable(
  "user_watchlist",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    targetPrice: numeric("target_price", { precision: 10, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("user_watchlist_user_id_idx").on(table.userId),
    uniqueIndex("user_watchlist_user_product_idx").on(
      table.userId,
      table.productId
    ),
  ]
);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    email: text("email"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("users_clerk_user_id_idx").on(table.clerkUserId)]
);

export const productsRelations = relations(products, ({ many }) => ({
  watchlistEntries: many(userWatchlist),
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const userWatchlistRelations = relations(userWatchlist, ({ one }) => ({
  product: one(products, {
    fields: [userWatchlist.productId],
    references: [products.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  watchlistEntries: many(userWatchlist),
}));

export const siteSettings = pgTable(
  "site_settings",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("site_settings_key_idx").on(table.key)]
);

export const frontendCategories = pgTable(
  "frontend_categories",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    displayName: text("display_name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    coverImageUrl: text("cover_image_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("frontend_categories_slug_idx").on(table.slug),
    index("frontend_categories_active_order_idx").on(
      table.isActive,
      table.displayOrder
    ),
  ]
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
export type UserWatchlistEntry = typeof userWatchlist.$inferSelect;
export type NewUserWatchlistEntry = typeof userWatchlist.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type FrontendCategory = typeof frontendCategories.$inferSelect;
export type NewFrontendCategory = typeof frontendCategories.$inferInsert;
