import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/db/schema";
import {
  buildInternalRedirectUrl,
  calculateDiscountPercent,
  formatPrice,
} from "@/lib/affiliate";
import { resolveProductImageUrl } from "@/lib/images";
import { WatchlistButton } from "./WatchlistButton";

type ProductCardProps = {
  product: Product;
  isWatchlisted?: boolean;
};

export function ProductCard({ product, isWatchlisted = false }: ProductCardProps) {
  const discount = calculateDiscountPercent(
    product.currentPrice,
    product.originalPrice
  );
  const redirectUrl = buildInternalRedirectUrl(product.sheinProductId);
  const imageUrl = resolveProductImageUrl(product.sheinProductId, product.imageUrl);

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden bg-neutral-100">
        <Link href={`/product/${product.id}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>

        {discount !== null && discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">
            -{discount}%
          </span>
        )}

        <WatchlistButton productId={product.id} isWatchlisted={isWatchlisted} />
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3">
        <Link href={`/product/${product.id}`}>
          <h3 className="line-clamp-2 text-sm leading-snug text-foreground transition-opacity group-hover:opacity-70">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{formatPrice(product.currentPrice)}</span>
          {product.originalPrice &&
            product.currentPrice &&
            Number.parseFloat(product.originalPrice) >
              Number.parseFloat(product.currentPrice) && (
              <span className="text-sm text-muted line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
        </div>

        <a
          href={redirectUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-auto inline-flex h-10 items-center justify-center rounded-full border border-foreground bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          View Deal
        </a>
      </div>
    </article>
  );
}
