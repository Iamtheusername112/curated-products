import { Suspense } from "react";
import { sql } from "drizzle-orm";
import { AdminNav } from "@/components/admin/AdminNav";
import { LookbookHub } from "@/components/admin/LookbookHub";
import {
  ensureDefaultFrontendCategories,
  ensureDefaultSiteSettings,
  getAllFrontendCategories,
} from "@/lib/cms-queries";
import { PAGE_CONTAINER, PAGE_EYEBROW, PAGE_HEADING } from "@/lib/layout-classes";
import { db } from "@/db";
import { products } from "@/db/schema";

export const metadata = {
  title: "Admin · Shopping modes",
};

async function getProductCountMap() {
  const rows = await db
    .select({
      category: products.category,
      count: sql<number>`count(*)::int`,
    })
    .from(products)
    .groupBy(products.category);

  const counts: Record<string, number> = {};
  for (const row of rows) {
    if (row.category) counts[row.category] = row.count;
  }
  return counts;
}

export default async function AdminPage() {
  await Promise.all([
    ensureDefaultSiteSettings(),
    ensureDefaultFrontendCategories(),
  ]);

  const [categories, productCounts] = await Promise.all([
    getAllFrontendCategories(),
    getProductCountMap(),
  ]);

  return (
    <div className={`${PAGE_CONTAINER} max-w-6xl py-12 md:py-16`}>
      <div className="mb-8 md:mb-10">
        <p className={PAGE_EYEBROW}>Storefront admin</p>
        <h1 className={`mt-3 ${PAGE_HEADING}`}>Manage shopping modes</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Create unlimited shopping moods (Y2K, Office, Coquette, etc.), hide ones you
          are not using, and add products to each from its manage page.
        </p>
      </div>

      <Suspense fallback={null}>
        <AdminNav />
      </Suspense>

      <LookbookHub categories={categories} productCounts={productCounts} />
    </div>
  );
}
