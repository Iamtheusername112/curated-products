"use server";

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { frontendCategories, productImages, products } from "@/db/schema";
import {
  buildSheinAffiliateUrl,
  extractSheinProductId,
  parsePrice,
  resolveAffiliateDestination,
} from "@/lib/affiliate";
import {
  resolveProductImagesFromForm,
} from "@/lib/admin-upload";
import { requireAdmin } from "@/lib/auth";
import { syncProductImages } from "@/lib/product-images";
import { parseProductAudience } from "@/lib/audience";
import { slugifyCategory } from "@/lib/utils";
import type { ProductAdminFormState } from "@/types/actions";

function revalidateProductPaths(categorySlug: string, productId?: number) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/admin/lookbooks/${categorySlug}`);
  revalidatePath(`/lookbook/${categorySlug}`);
  revalidatePath("/lookbook", "layout");
  if (productId) {
    revalidatePath(`/product/${productId}`);
  }
}

async function readImagesFromForm(
  formData: FormData,
  options: { isCreate: boolean; existingImageUrls?: string[] }
): Promise<string[]> {
  return resolveProductImagesFromForm(formData, options);
}

function storeAffiliateUrl(affiliateUrl: string, sheinProductId: string): string {
  try {
    return resolveAffiliateDestination(
      affiliateUrl,
      affiliateUrl,
      sheinProductId
    );
  } catch {
    return buildSheinAffiliateUrl(affiliateUrl, affiliateUrl);
  }
}

function resolveSheinProductId(affiliateUrl: string, title: string): string {
  return (
    extractSheinProductId(affiliateUrl) ??
    `curated-${slugifyCategory(title) || "product"}-${Date.now()}`
  );
}

function parseProductForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categorySlug = String(formData.get("categorySlug") ?? "").trim();
  const affiliateUrl = String(formData.get("affiliateUrl") ?? "").trim();
  const currentPrice = parsePrice(String(formData.get("currentPrice") ?? ""));
  const originalPrice = parsePrice(String(formData.get("originalPrice") ?? ""));
  const isTrending = formData.get("isTrending") === "on";
  const audience = parseProductAudience(String(formData.get("audience") ?? ""));

  return {
    title,
    description: description || null,
    categorySlug,
    affiliateUrl,
    currentPrice,
    originalPrice,
    isTrending,
    audience,
  };
}

export async function createCatalogProduct(
  _prev: ProductAdminFormState,
  formData: FormData
): Promise<ProductAdminFormState> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unauthorized",
    };
  }

  const parsed = parseProductForm(formData);

  if (!parsed.title) return { success: false, error: "Product title is required" };
  if (!parsed.categorySlug) {
    return { success: false, error: "Choose a shopping mode" };
  }
  if (!parsed.affiliateUrl) {
    return { success: false, error: "Affiliate link is required" };
  }

  try {
    const category = await db.query.frontendCategories.findFirst({
      where: eq(frontendCategories.slug, parsed.categorySlug),
    });

    if (!category) {
      return { success: false, error: "Shopping mode not found" };
    }

    const imageUrls = await readImagesFromForm(formData, { isCreate: true });
    const imageUrl = imageUrls[0];
    const sheinProductId = resolveSheinProductId(parsed.affiliateUrl, parsed.title);
    const normalizedAffiliateUrl = storeAffiliateUrl(
      parsed.affiliateUrl,
      sheinProductId
    );

    const [product] = await db
      .insert(products)
      .values({
        sheinProductId,
        title: parsed.title,
        description: parsed.description,
        imageUrl,
        currentPrice: parsed.currentPrice,
        originalPrice: parsed.originalPrice,
        rawProductUrl: parsed.affiliateUrl,
        affiliateUrl: normalizedAffiliateUrl,
        category: parsed.categorySlug,
        audience: parsed.audience,
        isTrending: parsed.isTrending,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: products.sheinProductId,
        set: {
          title: parsed.title,
          description: parsed.description,
          imageUrl,
          currentPrice: parsed.currentPrice,
          originalPrice: parsed.originalPrice,
          rawProductUrl: parsed.affiliateUrl,
          affiliateUrl: normalizedAffiliateUrl,
          category: parsed.categorySlug,
          audience: parsed.audience,
          isTrending: parsed.isTrending,
          updatedAt: new Date(),
        },
      })
      .returning({ id: products.id });

    await syncProductImages(product.id, imageUrls);

    revalidateProductPaths(parsed.categorySlug, product.id);

    return { success: true, productId: product.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create product",
    };
  }
}

export async function updateCatalogProduct(
  _prev: ProductAdminFormState,
  formData: FormData
): Promise<ProductAdminFormState> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unauthorized",
    };
  }

  const productId = Number.parseInt(String(formData.get("productId") ?? ""), 10);
  if (!Number.isFinite(productId)) {
    return { success: false, error: "Invalid product id" };
  }

  const parsed = parseProductForm(formData);

  if (!parsed.title) return { success: false, error: "Product title is required" };
  if (!parsed.categorySlug) {
    return { success: false, error: "Choose a shopping mode" };
  }
  if (!parsed.affiliateUrl) {
    return { success: false, error: "Affiliate link is required" };
  }

  try {
    const existing = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!existing) {
      return { success: false, error: "Product not found" };
    }

    const existingImageRows = await db
      .select({ imageUrl: productImages.imageUrl })
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.sortOrder), asc(productImages.id));

    const existingImageUrls =
      existingImageRows.length > 0
        ? existingImageRows.map((row) => row.imageUrl)
        : existing.imageUrl
          ? [existing.imageUrl]
          : [];

    const imageUrls = await readImagesFromForm(formData, {
      isCreate: false,
      existingImageUrls,
    });
    const imageUrl = imageUrls[0];

    const sheinProductId = resolveSheinProductId(parsed.affiliateUrl, parsed.title);
    const normalizedAffiliateUrl = storeAffiliateUrl(
      parsed.affiliateUrl,
      sheinProductId
    );

    await db
      .update(products)
      .set({
        title: parsed.title,
        description: parsed.description,
        imageUrl,
        currentPrice: parsed.currentPrice,
        originalPrice: parsed.originalPrice,
        rawProductUrl: parsed.affiliateUrl,
        affiliateUrl: normalizedAffiliateUrl,
        sheinProductId,
        category: parsed.categorySlug,
        audience: parsed.audience,
        isTrending: parsed.isTrending,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    await syncProductImages(productId, imageUrls);

    revalidateProductPaths(parsed.categorySlug, productId);
    if (existing.category && existing.category !== parsed.categorySlug) {
      revalidateProductPaths(existing.category, productId);
    }

    return { success: true, productId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update product",
    };
  }
}

export async function deleteCatalogProduct(
  _prev: ProductAdminFormState,
  formData: FormData
): Promise<ProductAdminFormState> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unauthorized",
    };
  }

  const productId = Number.parseInt(String(formData.get("productId") ?? ""), 10);
  if (!Number.isFinite(productId)) {
    return { success: false, error: "Invalid product id" };
  }

  try {
    const existing = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { id: true, category: true },
    });

    if (!existing) {
      return { success: false, error: "Product not found" };
    }

    await db.delete(products).where(eq(products.id, productId));

    if (existing.category) {
      revalidateProductPaths(existing.category, productId);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete product",
    };
  }
}

export async function getLookbookProductCounts() {
  try {
    await requireAdmin();
  } catch {
    return new Map<string, number>();
  }

  const rows = await db
    .select({
      category: products.category,
      count: sql<number>`count(*)::int`,
    })
    .from(products)
    .groupBy(products.category);

  const counts = new Map<string, number>();
  for (const row of rows) {
    if (row.category) counts.set(row.category, row.count);
  }

  return counts;
}

export async function getProductsForLookbook(slug: string) {
  try {
    await requireAdmin();
  } catch {
    return [];
  }

  return db.query.products.findMany({
    where: eq(products.category, slug),
    orderBy: [desc(products.updatedAt)],
  });
}
