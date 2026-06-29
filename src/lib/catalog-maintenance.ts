import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { frontendCategories, products } from "@/db/schema";
import { PRODUCT_PLACEHOLDER } from "@/lib/images";

export async function clearAllCatalogImages(): Promise<number> {
  const updated = await db
    .update(products)
    .set({
      imageUrl: PRODUCT_PLACEHOLDER,
      updatedAt: new Date(),
    })
    .where(sql`${products.imageUrl} NOT LIKE '/uploads/%'`)
    .returning({ id: products.id });

  await db
    .update(frontendCategories)
    .set({ coverImageUrl: null })
    .where(sql`${frontendCategories.coverImageUrl} IS NOT NULL`);

  revalidatePath("/");
  revalidatePath("/lookbook", "layout");
  revalidatePath("/admin");

  return updated.length;
}
