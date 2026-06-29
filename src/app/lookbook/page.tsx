import Link from "next/link";
import Image from "next/image";
import { desc, eq, inArray, sql } from "drizzle-orm";
import type { Metadata } from "next";
import {
  ensureDefaultFrontendCategories,
  getActiveFrontendCategories,
} from "@/lib/cms-queries";
import { db } from "@/db";
import { products } from "@/db/schema";
import { resolveCoverImageForDisplay } from "@/lib/images";
import { PAGE_CONTAINER, PAGE_EYEBROW, PAGE_HEADING } from "@/lib/layout-classes";

export const metadata: Metadata = {
  title: "Lookbooks",
  description: "Browse curated SHEIN lookbooks by mood and aesthetic.",
};

async function getCategoryProductCounts(slugs: string[]) {
  const counts = new Map<string, number>();

  if (slugs.length === 0) return counts;

  try {
    const rows = await db
      .select({
        category: products.category,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .where(inArray(products.category, slugs))
      .groupBy(products.category);

    for (const row of rows) {
      if (row.category) counts.set(row.category, row.count);
    }
  } catch {
    // ignore
  }

  return counts;
}

async function getLatestProductImageUrl(slug: string) {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.category, slug),
      orderBy: [desc(products.updatedAt)],
      columns: { imageUrl: true },
    });

    return product?.imageUrl ?? null;
  } catch {
    return null;
  }
}

export default async function LookbookIndexPage() {
  await ensureDefaultFrontendCategories();
  const categories = await getActiveFrontendCategories();
  const productCounts = await getCategoryProductCounts(
    categories.map((category) => category.slug)
  );

  const covers = await Promise.all(
    categories.map(async (category) => ({
      slug: category.slug,
      cover: resolveCoverImageForDisplay(
        category.coverImageUrl,
        await getLatestProductImageUrl(category.slug)
      ),
    }))
  );
  const coverMap = new Map(covers.map((entry) => [entry.slug, entry.cover]));

  return (
    <div className={`${PAGE_CONTAINER} py-12 md:py-16`}>
      <div className="mb-8 max-w-2xl md:mb-12">
        <p className={PAGE_EYEBROW}>Lookbooks</p>
        <h1 className={`mt-3 ${PAGE_HEADING}`}>Shop by mood</h1>
        <p className="mt-4 text-muted leading-relaxed">
          Curated edits for discovery and SEO — each lookbook is managed from your
          admin dashboard.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <h2 className="text-xl font-light">No lookbooks yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Add categories in the admin dashboard, then upload products via CSV so
            each lookbook has items to display.
          </p>
          <Link
            href="/admin"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm text-background"
          >
            Create a shopping mood
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => {
            const coverImage = coverMap.get(category.slug);
            const count = productCounts.get(category.slug) ?? 0;

            return (
              <Link
                key={category.slug}
                href={`/lookbook/${category.slug}`}
                className="group relative flex min-h-56 items-end overflow-hidden rounded-2xl border border-border bg-neutral-100 p-6 transition-shadow hover:shadow-lg"
              >
                {coverImage ? (
                  <Image
                    src={coverImage}
                    alt={category.displayName}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                <div className="relative">
                  <p className="text-xs tracking-[0.2em] text-white/80 uppercase">
                    {count > 0 ? `${count} products` : "Coming soon"}
                  </p>
                  <h2 className="mt-1 text-2xl font-light text-white">
                    {category.displayName}
                  </h2>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
