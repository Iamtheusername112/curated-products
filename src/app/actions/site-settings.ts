"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import {
  booleanToSettingValue,
  parseBooleanSetting,
  type SiteSettingKey,
} from "@/lib/site-settings";
import type { SiteSettingActionResult } from "@/types/actions";

function revalidatePublicPaths() {
  revalidatePath("/");
  revalidatePath("/lookbook", "layout");
  revalidatePath("/admin");
  revalidatePath("/dashboard/admin");
}

export async function toggleSiteSetting(
  key: SiteSettingKey,
  enabled: boolean
): Promise<SiteSettingActionResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unauthorized",
    };
  }

  const value = booleanToSettingValue(enabled);

  try {
    await db
      .insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value, updatedAt: new Date() },
      });

    revalidatePublicPaths();

    return { success: true, key, value };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update setting",
    };
  }
}

export async function toggleSiteSettingAction(
  _prevState: SiteSettingActionResult,
  formData: FormData
): Promise<SiteSettingActionResult> {
  const key = formData.get("key");
  const enabledRaw = formData.get("enabled");

  if (typeof key !== "string" || !key.trim()) {
    return { success: false, error: "Missing setting key" };
  }

  const enabled =
    enabledRaw === "true" ||
    enabledRaw === "1" ||
    parseBooleanSetting(String(enabledRaw ?? ""));

  return toggleSiteSetting(key as SiteSettingKey, enabled);
}

export async function updatePromoBannerText(
  _prevState: SiteSettingActionResult,
  formData: FormData
): Promise<SiteSettingActionResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unauthorized",
    };
  }

  const text = formData.get("promoText");
  if (typeof text !== "string") {
    return { success: false, error: "Invalid promo text" };
  }

  const key = "active_promo_banner";
  const value = text.trim();

  try {
    await db
      .insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value, updatedAt: new Date() },
      });

    revalidatePublicPaths();
    return { success: true, key, value };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update promo text",
    };
  }
}

export async function getSiteSettingValue(key: string): Promise<string | null> {
  try {
    const row = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, key),
    });
    return row?.value ?? null;
  } catch {
    return null;
  }
}
