"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { frontendCategories } from "@/db/schema";
import { normalizeCategorySlug } from "@/lib/cms-queries";
import { readCategoryCoverFromForm } from "@/lib/admin-upload";
import { normalizeStoredCoverImageUrl } from "@/lib/images";
import { requireAdmin } from "@/lib/auth";
import type { CategoryActionResult, CategoryFormState } from "@/types/actions";

function revalidateCategoryPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/lookbook", "layout");
  revalidatePath("/admin");
  if (slug) {
    revalidatePath(`/lookbook/${slug}`);
    revalidatePath(`/admin/lookbooks/${slug}`);
  }
}

async function nextCategoryDisplayOrder(): Promise<number> {
  const [row] = await db
    .select({
      maxOrder: sql<number>`coalesce(max(${frontendCategories.displayOrder}), -1)`,
    })
    .from(frontendCategories);

  return (row?.maxOrder ?? -1) + 1;
}

function parseDisplayOrder(value: FormDataEntryValue | null): number {
  const parsed = Number.parseInt(String(value ?? "0"), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function createFrontendCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unauthorized",
    };
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const orderFromForm = formData.get("displayOrder");
  const displayOrder =
    orderFromForm !== null && String(orderFromForm).trim() !== ""
      ? parseDisplayOrder(orderFromForm)
      : await nextCategoryDisplayOrder();

  if (!displayName) {
    return { success: false, error: "Display name is required" };
  }

  const slug = normalizeCategorySlug(slugInput || displayName);
  if (!slug) {
    return { success: false, error: "Could not generate a valid slug" };
  }

  try {
    const coverImageUrl = normalizeStoredCoverImageUrl(
      await readCategoryCoverFromForm(formData)
    );

    await db.insert(frontendCategories).values({
      slug,
      displayName,
      description: description || null,
      coverImageUrl,
      displayOrder,
      isActive: true,
    });

    revalidateCategoryPaths(slug);
    return { success: true, slug };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message.includes("unique")
            ? "A category with this slug already exists"
            : error.message
          : "Failed to create category",
    };
  }
}

export async function updateFrontendCategory(
  _prevState: CategoryActionResult,
  formData: FormData
): Promise<CategoryActionResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unauthorized",
    };
  }

  const id = Number.parseInt(String(formData.get("id") ?? ""), 10);
  const displayName = String(formData.get("displayName") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const displayOrder = parseDisplayOrder(formData.get("displayOrder"));
  const isActive = formData.get("isActive") === "true";

  if (!Number.isFinite(id)) {
    return { success: false, error: "Invalid category id" };
  }

  if (!displayName) {
    return { success: false, error: "Display name is required" };
  }

  try {
    const [existing] = await db
      .select({
        slug: frontendCategories.slug,
        coverImageUrl: frontendCategories.coverImageUrl,
      })
      .from(frontendCategories)
      .where(eq(frontendCategories.id, id))
      .limit(1);

    const coverImageUrl = normalizeStoredCoverImageUrl(
      await readCategoryCoverFromForm(formData, existing?.coverImageUrl)
    );

    await db
      .update(frontendCategories)
      .set({
        displayName,
        description: description || null,
        coverImageUrl,
        displayOrder,
        isActive,
      })
      .where(eq(frontendCategories.id, id));

    revalidateCategoryPaths(existing?.slug);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

export async function toggleCategoryActiveAction(
  _prevState: CategoryActionResult,
  formData: FormData
): Promise<CategoryActionResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unauthorized",
    };
  }

  const id = Number.parseInt(String(formData.get("id") ?? ""), 10);
  const isActive = formData.get("isActive") === "true";

  if (!Number.isFinite(id)) {
    return { success: false, error: "Invalid category id" };
  }

  try {
    const [existing] = await db
      .select({ slug: frontendCategories.slug })
      .from(frontendCategories)
      .where(eq(frontendCategories.id, id))
      .limit(1);

    await db
      .update(frontendCategories)
      .set({ isActive })
      .where(eq(frontendCategories.id, id));

    revalidateCategoryPaths(existing?.slug);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle category",
    };
  }
}

export async function deleteFrontendCategoryAction(
  _prevState: CategoryActionResult,
  formData: FormData
): Promise<CategoryActionResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unauthorized",
    };
  }

  const id = Number.parseInt(String(formData.get("id") ?? ""), 10);

  if (!Number.isFinite(id)) {
    return { success: false, error: "Invalid category id" };
  }

  try {
    const [existing] = await db
      .select({ slug: frontendCategories.slug })
      .from(frontendCategories)
      .where(eq(frontendCategories.id, id))
      .limit(1);

    await db.delete(frontendCategories).where(eq(frontendCategories.id, id));
    revalidateCategoryPaths(existing?.slug);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete category",
    };
  }
}
