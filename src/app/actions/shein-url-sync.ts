"use server";

import { requireAdmin } from "@/lib/auth";
import {
  normalizeCategorySlugInput,
  revalidateCatalogPaths,
  upsertScrapedProducts,
} from "@/lib/catalog-upsert";
import {
  parseProductLines,
  parseSheinJsonCatalog,
  productLinesToScrapedProducts,
} from "@/lib/shein-product-import";
import { isValidSheinCategoryUrl, scrapeSheinCategory } from "@/lib/shein-scraper";
import type { SheinUrlSyncResult } from "@/types/actions";

export async function syncFromSheinUrl(
  categoryUrl: string,
  categorySlug: string
): Promise<SheinUrlSyncResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      synced: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : "Unauthorized"],
    };
  }

  const trimmedUrl = categoryUrl.trim();
  const normalizedSlug = normalizeCategorySlugInput(categorySlug);

  if (!trimmedUrl) {
    return {
      success: false,
      synced: 0,
      skipped: 0,
      errors: ["Target SHEIN URL is required"],
    };
  }

  if (!isValidSheinCategoryUrl(trimmedUrl)) {
    return {
      success: false,
      synced: 0,
      skipped: 0,
      errors: ["Enter a valid SHEIN category or listing URL"],
    };
  }

  try {
    const scraped = await scrapeSheinCategory(trimmedUrl);
    const synced = await upsertScrapedProducts(scraped, normalizedSlug);

    revalidateCatalogPaths();

    return {
      success: true,
      synced,
      skipped: 0,
      errors: [],
      categorySlug: normalizedSlug,
      sourceUrl: trimmedUrl,
    };
  } catch (error) {
    return {
      success: false,
      synced: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : "Failed to sync from SHEIN URL"],
    };
  }
}

export async function syncFromSheinUrlAction(
  _prevState: SheinUrlSyncResult,
  formData: FormData
): Promise<SheinUrlSyncResult> {
  const categoryUrl = String(formData.get("categoryUrl") ?? "");
  const categorySlug = String(formData.get("categorySlug") ?? "");

  return syncFromSheinUrl(categoryUrl, categorySlug);
}

export async function syncFromProductLinesAction(
  _prevState: SheinUrlSyncResult,
  formData: FormData
): Promise<SheinUrlSyncResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      synced: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : "Unauthorized"],
    };
  }

  const categorySlug = normalizeCategorySlugInput(String(formData.get("categorySlug") ?? ""));
  const productLines = String(formData.get("productLines") ?? "");

  if (!productLines.trim()) {
    return {
      success: false,
      synced: 0,
      skipped: 0,
      errors: ["Paste at least one SHEIN product URL or ID"],
    };
  }

  const { rows, errors } = parseProductLines(productLines);

  if (rows.length === 0) {
    return {
      success: false,
      synced: 0,
      skipped: 0,
      errors: errors.length > 0 ? errors : ["No valid product lines found"],
    };
  }

  try {
    const scraped = productLinesToScrapedProducts(rows);
    const synced = await upsertScrapedProducts(scraped, categorySlug);
    revalidateCatalogPaths();

    return {
      success: true,
      synced,
      skipped: errors.length,
      errors,
      categorySlug,
    };
  } catch (error) {
    return {
      success: false,
      synced: 0,
      skipped: errors.length,
      errors: [
        error instanceof Error ? error.message : "Failed to import product lines",
        ...errors,
      ],
    };
  }
}

export async function syncFromSheinJsonAction(
  _prevState: SheinUrlSyncResult,
  formData: FormData
): Promise<SheinUrlSyncResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      synced: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : "Unauthorized"],
    };
  }

  const categorySlug = normalizeCategorySlugInput(String(formData.get("categorySlug") ?? ""));
  const jsonPayload = String(formData.get("jsonPayload") ?? "");

  if (!jsonPayload.trim()) {
    return {
      success: false,
      synced: 0,
      skipped: 0,
      errors: ["Paste a JSON product array"],
    };
  }

  const { rows, errors } = parseSheinJsonCatalog(jsonPayload);

  if (rows.length === 0) {
    return {
      success: false,
      synced: 0,
      skipped: 0,
      errors: errors.length > 0 ? errors : ["No products found in JSON"],
    };
  }

  try {
    const scraped = productLinesToScrapedProducts(rows);
    const synced = await upsertScrapedProducts(scraped, categorySlug);
    revalidateCatalogPaths();

    return {
      success: true,
      synced,
      skipped: errors.length,
      errors,
      categorySlug,
    };
  } catch (error) {
    return {
      success: false,
      synced: 0,
      skipped: errors.length,
      errors: [
        error instanceof Error ? error.message : "Failed to import JSON catalog",
        ...errors,
      ],
    };
  }
}
