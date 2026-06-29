import { sql } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

export async function getProductCount(): Promise<number> {
  try {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(products);
    return result[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function getTrendingProductCount(): Promise<number> {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(sql`${products.isTrending} = true`);
    return result[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function getBrokenAffiliateUrlCount(): Promise<number> {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(
        sql`${products.affiliateUrl} IS NULL OR trim(${products.affiliateUrl}) = '' OR ${products.affiliateUrl} NOT LIKE 'http%'`
      );
    return result[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function getBrokenImageUrlCount(): Promise<number> {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(
        sql`${products.imageUrl} IS NULL OR trim(${products.imageUrl}) = '' OR (${products.imageUrl} LIKE '%unsplash%' OR ${products.imageUrl} LIKE '%picsum%')`
      );
    return result[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

export type CatalogMetrics = {
  totalProducts: number;
  trendingProducts: number;
  brokenAffiliateUrls: number;
  brokenImageUrls: number;
};

export async function getCatalogMetrics(): Promise<CatalogMetrics> {
  const [totalProducts, trendingProducts, brokenAffiliateUrls, brokenImageUrls] =
    await Promise.all([
      getProductCount(),
      getTrendingProductCount(),
      getBrokenAffiliateUrlCount(),
      getBrokenImageUrlCount(),
    ]);

  return {
    totalProducts,
    trendingProducts,
    brokenAffiliateUrls,
    brokenImageUrls,
  };
}
