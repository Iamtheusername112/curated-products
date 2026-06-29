import Link from "next/link";
import { desc, eq, inArray, sql, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { ProductCard } from "@/components/ProductCard";
import { CountdownSaleBanner } from "@/components/CountdownSaleBanner";
import { FeaturedLookSection } from "@/components/home/FeaturedLookSection";
import { HomeHero } from "@/components/home/HomeHero";
import { LookbookCategoryCard } from "@/components/home/LookbookCategoryCard";
import { MemberHome } from "@/components/home/MemberHome";
import { TrustStrip } from "@/components/home/TrustStrip";
import { WatchlistInvitation } from "@/components/home/WatchlistInvitation";
import { db } from "@/db";
import { products } from "@/db/schema";
import {
  ensureDefaultFrontendCategories,
  ensureDefaultSiteSettings,
  getActiveFrontendCategories,
  getSiteSettingsMap,
} from "@/lib/cms-queries";
import { getUserWatchlistedProductIds, getUserWatchlistEntries } from "@/lib/watchlist-queries";
import { SITE_SETTING_KEYS, parseBooleanSetting } from "@/lib/site-settings";
import { resolveCategoryCoverUrl, resolveCoverImageForDisplay } from "@/lib/images";
import { PAGE_CONTAINER, PAGE_EYEBROW, PAGE_HEADING, PRODUCT_GRID } from "@/lib/layout-classes";

async function getFeaturedProducts(trendingOnly: boolean) {
  try {
    if (trendingOnly) {
      const trending = await db.query.products.findMany({
        where: eq(products.isTrending, true),
        orderBy: [desc(products.updatedAt)],
        limit: 8,
      });

      if (trending.length > 0) return trending;
    }

    return await db.query.products.findMany({
      orderBy: [desc(products.updatedAt)],
      limit: 8,
    });
  } catch {
    return [];
  }
}

async function getCategoryCovers(categorySlugs: string[]) {
  const covers = new Map<string, string>();

  try {
    await Promise.all(
      categorySlugs.map(async (slug) => {
        const product = await db.query.products.findFirst({
          where: eq(products.category, slug),
          orderBy: [desc(products.updatedAt)],
          columns: { imageUrl: true },
        });

        const cover = resolveCategoryCoverUrl(product?.imageUrl);
        if (cover) {
          covers.set(slug, cover);
        }
      })
    );
  } catch {
    // Database unavailable — category cards fall back to gradient placeholders.
  }

  return covers;
}

async function getCategoryStats(slugs: string[]) {
  const counts = new Map<string, number>();
  const minPrices = new Map<string, string>();

  if (slugs.length === 0) {
    return { counts, minPrices };
  }

  try {
    const countRows = await db
      .select({
        category: products.category,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .where(inArray(products.category, slugs))
      .groupBy(products.category);

    for (const row of countRows) {
      if (row.category) counts.set(row.category, row.count);
    }

    await Promise.all(
      slugs.map(async (slug) => {
        const cheapest = await db.query.products.findFirst({
          where: eq(products.category, slug),
          orderBy: [asc(products.currentPrice)],
          columns: { currentPrice: true },
        });

        if (cheapest?.currentPrice) {
          minPrices.set(slug, cheapest.currentPrice);
        }
      })
    );
  } catch {
    // ignore
  }

  return { counts, minPrices };
}

export default async function HomePage() {
  await Promise.all([
    ensureDefaultSiteSettings(),
    ensureDefaultFrontendCategories(),
  ]);

  const { userId } = await auth();
  const settings = await getSiteSettingsMap();
  const activeCategories = await getActiveFrontendCategories();

  const showCountdownBanner = parseBooleanSetting(
    settings.get(SITE_SETTING_KEYS.SHOW_COUNTDOWN_SALE_BANNER),
    false
  );
  const showTrendingCarousel = parseBooleanSetting(
    settings.get(SITE_SETTING_KEYS.SHOW_TRENDING_CAROUSEL),
    true
  );

  const promoText =
    settings.get(SITE_SETTING_KEYS.ACTIVE_PROMO_BANNER) ??
    "Summer edit — extra 15% off select styles";

  const categorySlugs = activeCategories.map((category) => category.slug);

  const [featuredProducts, categoryCovers, categoryStats, watchlistEntries] =
    await Promise.all([
      getFeaturedProducts(showTrendingCarousel),
      getCategoryCovers(categorySlugs),
      getCategoryStats(categorySlugs),
      userId ? getUserWatchlistEntries(userId) : Promise.resolve([]),
    ]);

  const watchlistedIds = userId
    ? await getUserWatchlistedProductIds(userId)
    : new Set<number>();

  if (userId) {
    const memberTrending = featuredProducts.slice(0, 8);

    return (
      <div>
        {showCountdownBanner && <CountdownSaleBanner promoText={promoText} />}
        <MemberHome
          watchlistEntries={watchlistEntries}
          activeCategories={activeCategories}
          categoryCovers={categoryCovers}
          categoryStats={categoryStats}
          trendingProducts={memberTrending}
          watchlistedIds={watchlistedIds}
        />
      </div>
    );
  }

  const heroImageUrl =
    resolveCategoryCoverUrl(featuredProducts[0]?.imageUrl) ??
    categoryCovers.values().next().value ??
    null;

  const primaryLookbookHref = activeCategories[0]
    ? `/lookbook/${activeCategories[0].slug}`
    : "/lookbook";

  const featuredLookProducts =
    featuredProducts.length >= 3
      ? featuredProducts.slice(0, 3)
      : featuredProducts.slice(0, 1);
  const trendingProducts =
    featuredProducts.length >= 3
      ? featuredProducts.slice(3, 11)
      : featuredProducts.slice(featuredLookProducts.length, 9);

  return (
    <div>
      {showCountdownBanner && <CountdownSaleBanner promoText={promoText} />}

      <HomeHero heroImageUrl={heroImageUrl} primaryLookbookHref={primaryLookbookHref} />
      <TrustStrip />

      {activeCategories.length > 0 && (
        <section className={`${PAGE_CONTAINER} py-16 md:py-24 lg:py-28`}>
          <div className="mb-8 max-w-2xl md:mb-12">
            <p className={PAGE_EYEBROW}>Shop by mood</p>
            <h2 className={`mt-3 ${PAGE_HEADING}`}>
              Find your aesthetic in one scroll
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              Each lookbook is a styled edit — pick a vibe, shop the pieces, save
              what you love.
            </p>
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

      <FeaturedLookSection
        products={featuredLookProducts}
        watchlistedIds={watchlistedIds}
      />

      {trendingProducts.length > 0 ? (
        <section className={`${PAGE_CONTAINER} pb-16 md:pb-24`}>
          <div className="mb-8 md:mb-10">
            <p className={PAGE_EYEBROW}>Trending now</p>
            <h2 className="mt-3 text-2xl font-light tracking-tight sm:text-3xl md:text-4xl">
              What everyone&apos;s adding to cart this week
            </h2>
            <p className="mt-3 text-sm text-muted sm:text-base">
              Hand-picked today. Priced to move.
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
      ) : (
        <section className={`${PAGE_CONTAINER} pb-16 md:pb-24`}>
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <h2 className="text-xl font-light tracking-tight">Your edit is loading</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">
              Import products from the admin dashboard to populate lookbooks and
              start curating your storefront.
            </p>
            <Link
              href="/admin/shein-ops"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm text-background"
            >
              Import products
            </Link>
          </div>
        </section>
      )}

      <WatchlistInvitation />
    </div>
  );
}
