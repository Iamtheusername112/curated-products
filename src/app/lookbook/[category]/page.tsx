import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { ProductCard } from "@/components/ProductCard";
import { getUserWatchlistedProductIds } from "@/lib/watchlist-queries";
import { db } from "@/db";
import { products } from "@/db/schema";
import { CURATED_CATEGORIES, formatCategoryLabel } from "@/lib/utils";

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  return CURATED_CATEGORIES.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const label = formatCategoryLabel(category);

  return {
    title: `${label} Lookbook`,
    description: `Shop curated ${label.toLowerCase()} SHEIN finds. Premium picks with live pricing and affiliate deals.`,
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
  const { category } = await params;
  const isKnownCategory = CURATED_CATEGORIES.some((c) => c.slug === category);

  if (!isKnownCategory) {
    notFound();
  }

  const { userId } = await auth();
  const categoryProducts = await getCategoryProducts(category);
  const watchlistedIds = userId
    ? await getUserWatchlistedProductIds(userId)
    : new Set<number>();
  const label = formatCategoryLabel(category);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12 max-w-2xl">
        <p className="text-sm tracking-[0.25em] text-muted uppercase">Lookbook</p>
        <h1 className="mt-3 text-4xl font-light tracking-tight md:text-5xl">
          {label}
        </h1>
        <p className="mt-4 text-muted leading-relaxed">
          A curated edit of {label.toLowerCase()} pieces — styled for discovery,
          indexed for search, and updated as prices change.
        </p>
      </div>

      {categoryProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-muted">
            No products in this lookbook yet. Upload a CSV from the admin dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {categoryProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWatchlisted={watchlistedIds.has(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
