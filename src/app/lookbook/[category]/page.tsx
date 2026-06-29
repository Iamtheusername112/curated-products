export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import {
  LookbookAudienceNav,
  LookbookAudienceSections,
} from "@/components/lookbook/LookbookAudienceSections";
import { getUserWatchlistedProductIds } from "@/lib/watchlist-queries";
import {
  ensureDefaultFrontendCategories,
  getActiveFrontendCategories,
  getFrontendCategoryBySlug,
} from "@/lib/cms-queries";
import {
  groupProductsByAudience,
  getVisibleLookbookSections,
} from "@/lib/audience";
import { PAGE_CONTAINER, PAGE_EYEBROW, PAGE_HEADING } from "@/lib/layout-classes";
import { db } from "@/db";
import { products } from "@/db/schema";

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  try {
    await ensureDefaultFrontendCategories();
    const categories = await getActiveFrontendCategories();
    return categories.map((category) => ({ category: category.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const record = await getFrontendCategoryBySlug(category);
  const label = record?.displayName ?? category;

  return {
    title: `${label} Lookbook`,
    description: `Shop curated ${label.toLowerCase()} SHEIN finds for women, men, and kids.`,
    openGraph: {
      title: `${label} Lookbook | Curated SHEIN`,
      description: `Discover the best ${label.toLowerCase()} styles from SHEIN.`,
    },
  };
}

async function getCategoryProducts(category: string) {
  try {
    return await db.query.products.findMany({
      where: eq(products.category, category),
      orderBy: [desc(products.updatedAt)],
    });
  } catch {
    return [];
  }
}

export default async function LookbookCategoryPage({ params }: PageProps) {
  await ensureDefaultFrontendCategories();

  const { category } = await params;
  const categoryRecord = await getFrontendCategoryBySlug(category);

  if (!categoryRecord || !categoryRecord.isActive) {
    notFound();
  }

  const { userId } = await auth();
  const categoryProducts = await getCategoryProducts(category);
  const watchlistedIds = userId
    ? await getUserWatchlistedProductIds(userId)
    : new Set<number>();

  const grouped = groupProductsByAudience(categoryProducts);
  const visibleSections = getVisibleLookbookSections(categoryProducts);

  return (
    <div className={`${PAGE_CONTAINER} py-12 md:py-16`}>
      <div className="mb-8 max-w-2xl md:mb-10">
        <p className={PAGE_EYEBROW}>Lookbook</p>
        <h1 className={`mt-3 ${PAGE_HEADING}`}>{categoryRecord.displayName}</h1>
        <p className="mt-4 text-muted leading-relaxed">
          {categoryRecord.description ??
            `A curated edit of ${categoryRecord.displayName.toLowerCase()} pieces — browse by women, men, or kids.`}
        </p>
      </div>

      {categoryProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-muted">No products in this lookbook yet.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Add products to this mood from the admin dashboard and assign each one
            to Women, Men, or Kids (Boys / Girls).
          </p>
          <Link
            href={`/admin/lookbooks/${categoryRecord.slug}`}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm text-background"
          >
            Add products in admin
          </Link>
          <Link
            href="/lookbook"
            className="mt-3 block text-sm text-muted underline underline-offset-4"
          >
            ← All lookbooks
          </Link>
        </div>
      ) : (
        <>
          <LookbookAudienceNav visibleSections={visibleSections} />
          <LookbookAudienceSections
            watchlistedIds={watchlistedIds}
            grouped={grouped}
            visibleSections={visibleSections}
          />
        </>
      )}
    </div>
  );
}
