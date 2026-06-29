import type { Product } from "@/db/schema";
import type { WatchlistEntryWithProduct } from "@/lib/watchlist-queries";
import Link from "next/link";
import {
  buildInternalRedirectUrl,
  calculateDiscountPercent,
  formatPrice,
} from "@/lib/affiliate";
import { ProductImage } from "@/components/ProductImage";
import { RemoveWatchlistButton } from "@/components/RemoveWatchlistButton";

type WatchlistItemCardProps = {
  entry: WatchlistEntryWithProduct;
};

export function WatchlistItemCard({ entry }: WatchlistItemCardProps) {
  const product = entry.product;

  const redirectUrl = buildInternalRedirectUrl(product.id);
  const discount = calculateDiscountPercent(
    product.currentPrice,
    product.originalPrice
  );

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white">
      <div className="relative aspect-[3/4] bg-neutral-100">
        <Link href={`/product/${product.id}`} className="absolute inset-0">
          <ProductImage
            sheinProductId={product.sheinProductId}
            imageUrl={product.imageUrl}
            alt={product.title}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        </Link>
        {discount !== null && discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">
            -{discount}%
          </span>
        )}
        <div className="absolute right-3 top-3">
          <RemoveWatchlistButton watchlistId={entry.id} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="line-clamp-2 text-sm leading-snug transition-opacity hover:opacity-70">
            {product.title}
          </h3>
        </Link>

        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">{formatPrice(product.currentPrice)}</span>
            {product.originalPrice &&
              product.currentPrice &&
              Number.parseFloat(product.originalPrice) >
                Number.parseFloat(product.currentPrice) && (
                <span className="ml-2 text-muted line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
          </p>
          {entry.targetPrice && (
            <p className="text-xs text-muted">
              Target price: {formatPrice(entry.targetPrice)}
            </p>
          )}
        </div>

        <a
          href={redirectUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-auto inline-flex h-10 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Shop on SHEIN
        </a>
      </div>
    </article>
  );
}

export function WatchlistPreviewCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100"
    >
      <ProductImage
        sheinProductId={product.sheinProductId}
        imageUrl={product.imageUrl}
        alt={product.title}
        sizes="160px"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <p className="line-clamp-1 text-xs text-white">{formatPrice(product.currentPrice)}</p>
      </div>
    </Link>
  );
}
