import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { products } from "@/db/schema";
import { buildSheinAffiliateUrl } from "@/lib/affiliate";
import { calculateRetailBenchmark, type ScrapedSheinProduct } from "@/lib/shein-scraper";
import { slugifyCategory } from "@/lib/utils";

export function mapScrapedProductsToRows(
  scraped: Array<
    ScrapedSheinProduct & {
      affiliateUrl?: string;
    }
  >,
  categorySlug: string
) {
  return scraped.map((item) => {
    const rawProductUrl = `https://www.shein.com/p-${item.goodsId}.html`;

    return {
      sheinProductId: item.goodsId,
      title: item.goodsName,
      imageUrl: item.imageUrl,
      currentPrice: item.salePrice,
      originalPrice: calculateRetailBenchmark(item.salePrice),
      rawProductUrl,
      affiliateUrl: item.affiliateUrl ?? buildSheinAffiliateUrl(item.goodsId),
      category: categorySlug,
      isTrending: true,
      updatedAt: new Date(),
    };
  });
}

export async function upsertScrapedProducts(
  scraped: ScrapedSheinProduct[],
  categorySlug: string
) {
  const values = mapScrapedProductsToRows(scraped, categorySlug);

  await db
    .insert(products)
    .values(values)
    .onConflictDoUpdate({
      target: products.sheinProductId,
      set: {
        title: sql`excluded.title`,
        imageUrl: sql`excluded.image_url`,
        currentPrice: sql`excluded.current_price`,
        originalPrice: sql`excluded.original_price`,
        rawProductUrl: sql`excluded.raw_product_url`,
        affiliateUrl: sql`excluded.affiliate_url`,
        category: sql`excluded.category`,
        isTrending: sql`excluded.is_trending`,
        updatedAt: sql`excluded.updated_at`,
      },
    });

  return values.length;
}

export function revalidateCatalogPaths() {
  revalidatePath("/");
  revalidatePath("/lookbook", "layout");
  revalidatePath("/product", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/shein-ops");
}

export function normalizeCategorySlugInput(input: string): string {
  const slug = slugifyCategory(input);
  if (!slug) {
    throw new Error("Category slug is required");
  }
  return slug;
}
