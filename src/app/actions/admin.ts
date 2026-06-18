"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { fixAllTestProductImages } from "@/lib/catalog-maintenance";
import type { PurgeCatalogResult, RefreshTestImagesResult } from "@/types/actions";

export async function purgeAllProducts(): Promise<PurgeCatalogResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Unauthorized",
    };
  }

  try {
    const result = await db.delete(products).returning({ id: products.id });

    revalidatePath("/");
    revalidatePath("/lookbook", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin");

    return {
      success: true,
      deletedCount: result.length,
    };
  } catch (error) {
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Failed to purge catalog",
    };
  }
}

export async function refreshTestProductImages(): Promise<RefreshTestImagesResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      updatedCount: 0,
      error: error instanceof Error ? error.message : "Unauthorized",
    };
  }

  try {
    const updatedCount = await fixAllTestProductImages();
    revalidatePath("/");
    revalidatePath("/lookbook", "layout");
    revalidatePath("/product", "layout");
    revalidatePath("/dashboard/admin");
    return { success: true, updatedCount };
  } catch (error) {
    return {
      success: false,
      updatedCount: 0,
      error: error instanceof Error ? error.message : "Failed to refresh images",
    };
  }
}

export async function refreshTestProductImagesAction(
  _prevState: RefreshTestImagesResult,
  _formData: FormData
): Promise<RefreshTestImagesResult> {
  return refreshTestProductImages();
}

export async function purgeAllProductsAction(
  _prevState: PurgeCatalogResult,
  _formData: FormData
): Promise<PurgeCatalogResult> {
  return purgeAllProducts();
}
