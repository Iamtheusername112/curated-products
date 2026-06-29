import Link from "next/link";
import type { Product } from "@/db/schema";
import {
  buildInternalRedirectUrl,
  calculateDiscountPercent,
  formatPrice,
} from "@/lib/affiliate";
import { ProductImage } from "@/components/ProductImage";
import { SaveLookButton } from "@/components/SaveLookButton";
import { PAGE_CONTAINER } from "@/lib/layout-classes";
import { formatCategoryLabel } from "@/lib/utils";

type FeaturedLookSectionProps = {
  products: Product[];
  watchlistedIds?: Set<number>;
};

function FeaturedLookCard({
  product,
  featured = false,
  isWatchlisted = false,
}: {
  product: Product;
  featured?: boolean;
  isWatchlisted?: boolean;
}) {
  const discount = calculateDiscountPercent(
    product.currentPrice,
    product.originalPrice
  );
  const redirectUrl = buildInternalRedirectUrl(product.id);
  const categoryLabel = product.category
    ? formatCategoryLabel(product.category)
    : "Editor's pick";

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl bg-neutral-100 ${
        featured ? "min-h-[420px] lg:min-h-[560px]" : "min-h-[240px] lg:min-h-[268px]"
      }`}
    >
      <div className="absolute inset-0">
        <ProductImage
          sheinProductId={product.sheinProductId}
          imageUrl={product.imageUrl}
          alt={product.title}
          sizes={
            featured ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"
          }
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

      {discount !== null && discount > 0 && (
        <span className="absolute left-4 top-4 z-20 rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-950">
          -{discount}%
        </span>
      )}

      <SaveLookButton productId={product.id} isWatchlisted={isWatchlisted} />

      <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-6">
        <p className="text-xs tracking-[0.2em] text-white/70 uppercase">
          {categoryLabel}
        </p>
        <Link href={`/product/${product.id}`}>
          <h3
            className={`mt-2 font-light text-white transition-opacity hover:opacity-80 ${
              featured
                ? "line-clamp-2 text-xl md:text-2xl"
                : "line-clamp-2 text-base md:text-lg"
            }`}
          >
            {product.title}
          </h3>
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-white">
            {formatPrice(product.currentPrice)}
          </span>
          <a
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex h-9 items-center rounded-full bg-white px-4 text-xs font-medium text-neutral-950 transition-opacity hover:opacity-90"
          >
            Get this look
          </a>
        </div>
      </div>
    </article>
  );
}

export function FeaturedLookSection({
  products,
  watchlistedIds = new Set(),
}: FeaturedLookSectionProps) {
  if (products.length === 0) return null;

  const [hero, ...rest] = products;

  return (
    <section className={`${PAGE_CONTAINER} py-16 md:py-20`}>
      <div className="mb-8 max-w-2xl md:mb-10">
        <p className="text-xs tracking-[0.25em] text-muted uppercase sm:text-sm">
          Look of the week
        </p>
        <h2 className="mt-3 text-2xl font-light tracking-tight sm:text-3xl md:text-4xl">
          The pieces worth opening SHEIN for
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          One hero edit, styled for the scroll-stoppers — priced to move today.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <FeaturedLookCard
          product={hero}
          featured
          isWatchlisted={watchlistedIds.has(hero.id)}
        />
        {rest.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
            {rest.slice(0, 2).map((product) => (
              <FeaturedLookCard
                key={product.id}
                product={product}
                isWatchlisted={watchlistedIds.has(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
