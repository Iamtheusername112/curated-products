import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { productImages, products } from "@/db/schema";
import { isAdminProductImage } from "@/lib/images";

export const MAX_PRODUCT_IMAGES = 20;

export function resolveStoredProductImages(
  imageUrls: string[],
  fallbackImageUrl?: string | null
): string[] {
  const fromGallery = imageUrls.filter((url) => isAdminProductImage(url));
  if (fromGallery.length > 0) {
    return fromGallery.slice(0, MAX_PRODUCT_IMAGES);
  }

  if (isAdminProductImage(fallbackImageUrl)) {
    return [fallbackImageUrl!];
  }

  return [];
}

export async function getProductImageUrls(productId: number): Promise<string[]> {
  const rows = await db
    .select({ imageUrl: productImages.imageUrl })
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.sortOrder), asc(productImages.id));

  if (rows.length > 0) {
    return rows.map((row) => row.imageUrl);
  }

  const [product] = await db
    .select({ imageUrl: products.imageUrl })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  return resolveStoredProductImages([], product?.imageUrl);
}

export async function getProductImagesByProductIds(
  productIds: number[]
): Promise<Map<number, string[]>> {
  const map = new Map<number, string[]>();
  if (productIds.length === 0) return map;

  const rows = await db
    .select({
      productId: productImages.productId,
      imageUrl: productImages.imageUrl,
      sortOrder: productImages.sortOrder,
      id: productImages.id,
    })
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .orderBy(asc(productImages.sortOrder), asc(productImages.id));

  for (const row of rows) {
    const current = map.get(row.productId) ?? [];
    current.push(row.imageUrl);
    map.set(row.productId, current);
  }

  return map;
}

export async function syncProductImages(
  productId: number,
  imageUrls: string[]
): Promise<string[]> {
  const normalized = imageUrls
    .filter((url) => isAdminProductImage(url))
    .slice(0, MAX_PRODUCT_IMAGES);

  await db.delete(productImages).where(eq(productImages.productId, productId));

  if (normalized.length > 0) {
    await db.insert(productImages).values(
      normalized.map((imageUrl, index) => ({
        productId,
        imageUrl,
        sortOrder: index,
      }))
    );
  }

  return normalized;
}

export async function getPrimaryProductImageUrl(
  productId: number,
  fallbackImageUrl?: string | null
): Promise<string> {
  const images = await getProductImageUrls(productId);
  return images[0] ?? fallbackImageUrl ?? "";
}
