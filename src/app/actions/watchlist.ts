"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { products, userWatchlist } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { ensureCurrentUserSynced } from "@/lib/user-sync";
import type { WatchlistActionResult } from "@/types/actions";

function revalidateWatchlistPaths(productId: number) {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/product/${productId}`);
  revalidatePath("/lookbook", "layout");
}

async function verifySavedLook(userId: string, productId: number) {
  return db.query.userWatchlist.findFirst({
    where: and(
      eq(userWatchlist.userId, userId),
      eq(userWatchlist.productId, productId)
    ),
    columns: { id: true },
  });
}

export async function toggleWatchlist(
  productId: number,
  targetPrice?: string | null
): Promise<WatchlistActionResult> {
  let userId: string;

  try {
    userId = await requireAuth();
  } catch {
    return { success: false, error: "Sign in to save items to your watchlist" };
  }

  try {
    await ensureCurrentUserSynced();
  } catch {
    // Watchlist rows use Clerk user id directly; sync is best-effort.
  }

  if (!Number.isInteger(productId) || productId <= 0) {
    return { success: false, error: "Invalid product" };
  }

  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { id: true },
    });

    if (!product) {
      return { success: false, error: "Product not found in catalog" };
    }

    const existing = await verifySavedLook(userId, productId);

    if (existing) {
      await db
        .delete(userWatchlist)
        .where(
          and(
            eq(userWatchlist.userId, userId),
            eq(userWatchlist.productId, productId)
          )
        );

      revalidateWatchlistPaths(productId);

      return { success: true, isWatchlisted: false };
    }

    const [inserted] = await db
      .insert(userWatchlist)
      .values({
        userId,
        productId,
        targetPrice: targetPrice ?? null,
      })
      .returning({ id: userWatchlist.id });

    if (!inserted) {
      return { success: false, error: "Could not write saved look to database" };
    }

    const verified = await verifySavedLook(userId, productId);

    if (!verified) {
      return {
        success: false,
        error: "Save could not be verified — please try again",
      };
    }

    revalidateWatchlistPaths(productId);

    return {
      success: true,
      isWatchlisted: true,
      watchlistId: verified.id,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update watchlist";

    if (message.includes("user_watchlist_user_product_idx")) {
      return { success: true, isWatchlisted: true };
    }

    return { success: false, error: message };
  }
}

export async function removeFromWatchlist(
  watchlistId: number
): Promise<WatchlistActionResult> {
  let userId: string;

  try {
    userId = await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const entry = await db.query.userWatchlist.findFirst({
      where: and(
        eq(userWatchlist.id, watchlistId),
        eq(userWatchlist.userId, userId)
      ),
      columns: { productId: true },
    });

    if (!entry) {
      return { success: false, error: "Saved look not found" };
    }

    await db
      .delete(userWatchlist)
      .where(
        and(eq(userWatchlist.id, watchlistId), eq(userWatchlist.userId, userId))
      );

    revalidateWatchlistPaths(entry.productId);
    revalidatePath("/dashboard");

    return { success: true, isWatchlisted: false };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove from watchlist";

    return { success: false, error: message };
  }
}
