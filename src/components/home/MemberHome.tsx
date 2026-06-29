import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ProductCard } from "@/components/ProductCard";
import {
  WatchlistPreviewCard,
} from "@/components/account/WatchlistItemCard";
import { LookbookCategoryCard } from "@/components/home/LookbookCategoryCard";
import type { Product } from "@/db/schema";
import type { WatchlistEntryWithProduct } from "@/lib/watchlist-queries";
import { resolveCoverImageForDisplay } from "@/lib/images";
import { PAGE_CONTAINER, PRODUCT_GRID } from "@/lib/layout-classes";

type MemberHomeProps = {
  watchlistEntries: WatchlistEntryWithProduct[];
  activeCategories: Array<{
    slug: string;
    displayName: string;
    coverImageUrl: string | null;
  }>;
  categoryCovers: Map<string, string>;
  categoryStats: {
    counts: Map<string, number>;
    minPrices: Map<string, string>;
  };
  trendingProducts: Product[];
  watchlistedIds: Set<number>;
};

export async function MemberHome({
  watchlistEntries,
  activeCategories,
  categoryCovers,
  categoryStats,
  trendingProducts,
  watchlistedIds,
}: MemberHomeProps) {
  const user = await currentUser();
  const firstName = user?.firstName?.trim() || "there";
  const savedProducts = watchlistEntries.map((entry) => entry.product);
  const savedCount = savedProducts.length;

  return (
    <div className="bg-neutral-50">
      <section className={`${PAGE_CONTAINER} border-b border-border bg-white py-10 md:py-14`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] text-muted uppercase">Your account</p>
            <h1 className="mt-3 text-3xl font-light tracking-tight md:text-4xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              {savedCount > 0
                ? `You have ${savedCount} saved ${savedCount === 1 ? "look" : "looks"}. We'll keep an eye on pricing while you browse.`
                : "Start saving pieces you love — your watchlist lives here, not on a marketing page."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Open saved looks
            </Link>
            <Link
              href="/lookbook"
              className="inline-flex h-11 items-center rounded-full border border-border bg-white px-6 text-sm transition-colors hover:border-foreground"
            >
              Browse lookbooks
            </Link>
          </div>
        </div>

        {savedCount > 0 && (
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium tracking-wide">Recently saved</h2>
              <Link
                href="/dashboard"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
              {savedProducts.slice(0, 4).map((product) => (
                <WatchlistPreviewCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>

      {activeCategories.length > 0 && (
        <section className={`${PAGE_CONTAINER} py-12 md:py-16`}>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-light tracking-tight sm:text-2xl">
                Continue exploring
              </h2>
              <p className="mt-2 text-sm text-muted">Pick up where you left off by mood.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {activeCategories.map((category) => (
              <LookbookCategoryCard
                key={category.slug}
                category={category}
                coverImage={resolveCoverImageForDisplay(
                  category.coverImageUrl,
                  categoryCovers.get(category.slug)
                )}
                productCount={categoryStats.counts.get(category.slug) ?? 0}
                fromPrice={categoryStats.minPrices.get(category.slug) ?? null}
              />
            ))}
          </div>
        </section>
      )}

      {trendingProducts.length > 0 && (
        <section className={`${PAGE_CONTAINER} pb-16 md:pb-20`}>
          <div className="mb-8">
            <h2 className="text-xl font-light tracking-tight sm:text-2xl">
              Recommended for you
            </h2>
            <p className="mt-2 text-sm text-muted">
              Fresh picks worth adding to your saved looks.
            </p>
          </div>
          <div className={PRODUCT_GRID}>
            {trendingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWatchlisted={watchlistedIds.has(product.id)}
                ctaLabel="Get this look"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
