import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userWatchlist } from "@/db/schema";

export async function getUserWatchlistedProductIds(
  userId: string
): Promise<Set<number>> {
  const entries = await db.query.userWatchlist.findMany({
    where: eq(userWatchlist.userId, userId),
    columns: { productId: true },
  });

  return new Set(entries.map((entry) => entry.productId));
}
