"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { userWatchlist } from "@/db/schema";
import type { WatchlistActionResult } from "@/types/actions";

export async function toggleWatchlist(
  productId: number,
  targetPrice?: string | null
): Promise<WatchlistActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Sign in to save items to your watchlist" };
  }

  try {
    const existing = await db.query.userWatchlist.findFirst({
      where: and(
        eq(userWatchlist.userId, userId),
        eq(userWatchlist.productId, productId)
      ),
    });

    if (existing) {
      await db
        .delete(userWatchlist)
        .where(
          and(
            eq(userWatchlist.userId, userId),
            eq(userWatchlist.productId, productId)
          )
        );

      revalidatePath("/dashboard");
      revalidatePath("/lookbook", "layout");

      return { success: true, isWatchlisted: false };
    }

    await db.insert(userWatchlist).values({
      userId,
      productId,
      targetPrice: targetPrice ?? null,
    });

    revalidatePath("/dashboard");
    revalidatePath("/lookbook", "layout");

    return { success: true, isWatchlisted: true };
  } catch {
    return { success: false, error: "Failed to update watchlist" };
  }
}

export async function removeFromWatchlist(
  watchlistId: number
): Promise<WatchlistActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .delete(userWatchlist)
      .where(
        and(
          eq(userWatchlist.id, watchlistId),
          eq(userWatchlist.userId, userId)
        )
      );

    revalidatePath("/dashboard");

    return { success: true, isWatchlisted: false };
  } catch {
    return { success: false, error: "Failed to remove from watchlist" };
  }
}
