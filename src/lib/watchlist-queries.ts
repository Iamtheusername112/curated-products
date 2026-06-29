import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, userWatchlist, type Product } from "@/db/schema";

export type WatchlistEntryWithProduct = {
  id: number;
  userId: string;
  productId: number;
  targetPrice: string | null;
  createdAt: Date;
  product: Product;
};

export async function getUserWatchlistedProductIds(
  userId: string
): Promise<Set<number>> {
  const entries = await db
    .select({ productId: userWatchlist.productId })
    .from(userWatchlist)
    .where(eq(userWatchlist.userId, userId));

  return new Set(entries.map((entry) => entry.productId));
}

export async function getUserWatchlistEntries(
  userId: string,
  limit?: number
): Promise<WatchlistEntryWithProduct[]> {
  const baseQuery = db
    .select({
      entry: userWatchlist,
      product: products,
    })
    .from(userWatchlist)
    .innerJoin(products, eq(userWatchlist.productId, products.id))
    .where(eq(userWatchlist.userId, userId))
    .orderBy(desc(userWatchlist.createdAt));

  const rows = limit ? await baseQuery.limit(limit) : await baseQuery;

  return rows.map(({ entry, product }) => ({
    id: entry.id,
    userId: entry.userId,
    productId: entry.productId,
    targetPrice: entry.targetPrice,
    createdAt: entry.createdAt,
    product,
  }));
}

export async function getUserWatchlistCount(userId: string): Promise<number> {
  const entries = await getUserWatchlistEntries(userId);
  return entries.length;
}
