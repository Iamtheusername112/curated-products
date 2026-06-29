import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { frontendCategories, siteSettings } from "@/db/schema";
import {
  DEFAULT_SITE_SETTINGS,
  parseBooleanSetting,
  type SiteSettingKey,
} from "@/lib/site-settings";
import { CURATED_CATEGORIES, slugifyCategory } from "@/lib/utils";

export async function ensureDefaultSiteSettings() {
  try {
    for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
      await db
        .insert(siteSettings)
        .values({ key, value })
        .onConflictDoNothing({ target: siteSettings.key });
    }
  } catch {
    // Database unavailable during build or first boot.
  }
}

export async function ensureDefaultFrontendCategories() {
  try {
    await db
      .insert(frontendCategories)
      .values(
        CURATED_CATEGORIES.map((category, index) => ({
          slug: category.slug,
          displayName: category.label,
          isActive: true,
          displayOrder: index,
        }))
      )
      .onConflictDoNothing({ target: frontendCategories.slug });
  } catch {
    // Database unavailable during build or first boot.
  }
}

function dedupeCategoriesBySlug<T extends { slug: string; id: number }>(
  rows: T[]
): T[] {
  const bySlug = new Map<string, T>();

  for (const row of rows) {
    const existing = bySlug.get(row.slug);
    if (!existing || row.id < existing.id) {
      bySlug.set(row.slug, row);
    }
  }

  return [...bySlug.values()];
}

export async function getSiteSettingsMap(): Promise<Map<string, string>> {
  try {
    const rows = await db.select().from(siteSettings);
    const map = new Map<string, string>();

    for (const row of rows) {
      map.set(row.key, row.value);
    }

    for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
      if (!map.has(key)) {
        map.set(key, value);
      }
    }

    return map;
  } catch {
    return new Map(Object.entries(DEFAULT_SITE_SETTINGS));
  }
}

export async function isSiteSettingEnabled(
  key: SiteSettingKey,
  defaultValue = false
): Promise<boolean> {
  const settings = await getSiteSettingsMap();
  return parseBooleanSetting(settings.get(key), defaultValue);
}

export async function getActiveFrontendCategories() {
  try {
    const rows = await db.query.frontendCategories.findMany({
      where: eq(frontendCategories.isActive, true),
      orderBy: [
        asc(frontendCategories.displayOrder),
        asc(frontendCategories.displayName),
        asc(frontendCategories.id),
      ],
    });

    return dedupeCategoriesBySlug(rows);
  } catch {
    return [];
  }
}

export async function getAllFrontendCategories() {
  try {
    const rows = await db.query.frontendCategories.findMany({
      orderBy: [
        asc(frontendCategories.displayOrder),
        asc(frontendCategories.displayName),
        asc(frontendCategories.id),
      ],
    });

    return dedupeCategoriesBySlug(rows);
  } catch {
    return [];
  }
}

export async function getFrontendCategoryBySlug(slug: string) {
  try {
    return await db.query.frontendCategories.findFirst({
      where: eq(frontendCategories.slug, slug),
    });
  } catch {
    return null;
  }
}

export function normalizeCategorySlug(input: string): string {
  return slugifyCategory(input);
}

export type CategoryOption = {
  slug: string;
  label: string;
};

export async function getCategoryOptionsForUpload(): Promise<CategoryOption[]> {
  const categories = await getActiveFrontendCategories();

  if (categories.length > 0) {
    return categories.map((category) => ({
      slug: category.slug,
      label: category.displayName,
    }));
  }

  return CURATED_CATEGORIES.map((category) => ({
    slug: category.slug,
    label: category.label,
  }));
}
