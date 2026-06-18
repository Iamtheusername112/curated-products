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
    imageUrl: text("image_url").notNull(),
    currentPrice: numeric("current_price", { precision: 10, scale: 2 }),
    originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
    rawProductUrl: text("raw_product_url"),
    affiliateUrl: text("affiliate_url").notNull(),
    category: text("category"),
    isTrending: boolean("is_trending").default(false).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("products_shein_product_id_idx").on(table.sheinProductId),
    index("products_category_idx").on(table.category),
  ]
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

export const productsRelations = relations(products, ({ many }) => ({
  watchlistEntries: many(userWatchlist),
}));

export const userWatchlistRelations = relations(userWatchlist, ({ one }) => ({
  product: one(products, {
    fields: [userWatchlist.productId],
    references: [products.id],
  }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type UserWatchlistEntry = typeof userWatchlist.$inferSelect;
export type NewUserWatchlistEntry = typeof userWatchlist.$inferInsert;
