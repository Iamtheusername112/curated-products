import { sql } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

export async function getProductCount(): Promise<number> {
  try {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(products);
    return result[0]?.count ?? 0;
  } catch {
    return 0;
  }
}
