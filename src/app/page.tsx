import Link from "next/link";
import Image from "next/image";
import { desc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { ProductCard } from "@/components/ProductCard";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getUserWatchlistedProductIds } from "@/lib/watchlist-queries";
import { autoFixBrokenProductImages } from "@/lib/catalog-maintenance";
import { CURATED_CATEGORIES } from "@/lib/utils";
import { resolveProductImageUrl } from "@/lib/images";

async function getFeaturedProducts() {
  try {
    const trending = await db.query.products.findMany({
      where: eq(products.isTrending, true),
      orderBy: [desc(products.updatedAt)],
      limit: 8,
    });

    if (trending.length > 0) {
      return trending;
    }

    return await db.query.products.findMany({
      orderBy: [desc(products.updatedAt)],
      limit: 8,
    });
  } catch {
    return [];
  }
}

async function getCategoryCovers() {
  const covers = new Map<string, string>();

  try {
    await Promise.all(
      CURATED_CATEGORIES.map(async (category) => {
        const product = await db.query.products.findFirst({
          where: eq(products.category, category.slug),
          orderBy: [desc(products.updatedAt)],
          columns: { imageUrl: true, sheinProductId: true },
        });

        if (product?.imageUrl) {
          covers.set(
            category.slug,
            resolveProductImageUrl(product.sheinProductId, product.imageUrl)
          );
        }
      })
    );
  } catch {
    // Database unavailable — category cards fall back to gradient placeholders.
  }

  return covers;
}

export default async function HomePage() {
  await autoFixBrokenProductImages();

  const { userId } = await auth();
  const [featuredProducts, categoryCovers] = await Promise.all([
    getFeaturedProducts(),
    getCategoryCovers(),
  ]);
  const watchlistedIds = userId
    ? await getUserWatchlistedProductIds(userId)
    : new Set<number>();

  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-sm tracking-[0.25em] text-muted uppercase">
            Curated Fashion
          </p>
          <h1 className="mt-4 text-4xl font-light tracking-tight md:text-6xl">
            Premium lookbooks for SHEIN finds
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Discover hand-picked styles across trending aesthetics. Save items to
            your watchlist and get notified when prices drop.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-light tracking-tight">Shop by mood</h2>
            <p className="mt-2 text-sm text-muted">
              Programmatic lookbooks built for discovery and SEO.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CURATED_CATEGORIES.map((category) => {
            const coverImage = categoryCovers.get(category.slug);

            return (
              <Link
                key={category.slug}
                href={`/lookbook/${category.slug}`}
                className="group relative flex min-h-56 items-end overflow-hidden rounded-2xl border border-border bg-neutral-100 p-6 transition-shadow hover:shadow-lg"
              >
                {coverImage ? (
                  <Image
                    src={coverImage}
                    alt={category.label}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                <div className="relative">
                  <p className="text-xs tracking-[0.2em] text-white/80 uppercase">
                    Lookbook
                  </p>
                  <h3 className="mt-1 text-2xl font-light text-white">
                    {category.label}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {featuredProducts.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="mb-10">
            <h2 className="text-2xl font-light tracking-tight">Featured picks</h2>
            <p className="mt-2 text-sm text-muted">
              Fresh products synced from your affiliate feed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWatchlisted={watchlistedIds.has(product.id)}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <h2 className="text-xl font-light tracking-tight">No products yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">
              Import your SHEIN affiliate CSV to populate lookbooks and product
              cards. Sign in, then upload at the admin sync page.
            </p>
            <Link
              href="/dashboard/admin"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm text-background"
            >
              Import products
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
