import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { products } from "@/db/schema";
import { buildTestImageUrl, isBrokenProductImageUrl } from "@/lib/images";

async function fixProductImages(
  productList: Array<{ id: number; sheinProductId: string; imageUrl: string }>
) {
  if (productList.length === 0) {
    return 0;
  }

  await Promise.all(
    productList.map((product) =>
      db
        .update(products)
        .set({
          imageUrl: buildTestImageUrl(product.sheinProductId),
          updatedAt: new Date(),
        })
        .where(eq(products.id, product.id))
    )
  );

  return productList.length;
}

export async function autoFixBrokenProductImages(): Promise<number> {
  try {
    const allProducts = await db.query.products.findMany({
      columns: { id: true, sheinProductId: true, imageUrl: true },
    });

    const needsFix = allProducts.filter((product) =>
      isBrokenProductImageUrl(product.imageUrl)
    );

    const updatedCount = await fixProductImages(needsFix);

    if (updatedCount > 0) {
      revalidatePath("/");
      revalidatePath("/lookbook", "layout");
      revalidatePath("/product", "layout");
    }

    return updatedCount;
  } catch {
    return 0;
  }
}

export async function fixAllTestProductImages(): Promise<number> {
  const brokenProducts = await db.query.products.findMany({
    where: sql`${products.imageUrl} ilike ${"%unsplash.com%"} OR ${products.imageUrl} ilike ${"%picsum.photos%"}`,
    columns: { id: true, sheinProductId: true, imageUrl: true },
  });

  const needsFix = brokenProducts.filter((product) =>
    isBrokenProductImageUrl(product.imageUrl)
  );

  return fixProductImages(needsFix);
}
