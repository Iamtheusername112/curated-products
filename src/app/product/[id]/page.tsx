import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { WatchlistButton } from "@/components/WatchlistButton";
import { getUserWatchlistedProductIds } from "@/lib/watchlist-queries";
import { db } from "@/db";
import { products } from "@/db/schema";
import {
  buildInternalRedirectUrl,
  calculateDiscountPercent,
  formatPrice,
} from "@/lib/affiliate";
import { formatCategoryLabel } from "@/lib/utils";
import { resolveProductImageUrl } from "@/lib/images";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const productId = Number.parseInt(id, 10);

  if (Number.isNaN(productId)) {
    return { title: "Product Not Found" };
  }

  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      return { title: "Product Not Found" };
    }

    return {
      title: product.title,
      description: `Shop ${product.title} on SHEIN. Current price ${formatPrice(product.currentPrice)}.`,
      openGraph: {
        title: product.title,
        images: [
          {
            url: resolveProductImageUrl(product.sheinProductId, product.imageUrl),
          },
        ],
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const productId = Number.parseInt(id, 10);

  if (Number.isNaN(productId)) {
    notFound();
  }

  let product;

  try {
    product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  const { userId } = await auth();
  const watchlistedIds = userId
    ? await getUserWatchlistedProductIds(userId)
    : new Set<number>();

  const discount = calculateDiscountPercent(
    product.currentPrice,
    product.originalPrice
  );
  const redirectUrl = buildInternalRedirectUrl(product.sheinProductId);
  const imageUrl = resolveProductImageUrl(product.sheinProductId, product.imageUrl);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative overflow-hidden bg-neutral-100">
          <div className="relative aspect-[3/4]">
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {discount !== null && discount > 0 && (
            <span className="absolute left-4 top-4 rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background">
              -{discount}% off
            </span>
          )}
          <WatchlistButton
            productId={product.id}
            isWatchlisted={watchlistedIds.has(product.id)}
          />
        </div>

        <div className="flex flex-col justify-center">
          {product.category && (
            <Link
              href={`/lookbook/${product.category}`}
              className="text-sm tracking-[0.2em] text-muted uppercase transition-colors hover:text-foreground"
            >
              {formatCategoryLabel(product.category)}
            </Link>
          )}

          <h1 className="mt-4 text-3xl font-light tracking-tight md:text-4xl">
            {product.title}
          </h1>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-2xl font-medium">
              {formatPrice(product.currentPrice)}
            </span>
            {product.originalPrice &&
              product.currentPrice &&
              Number.parseFloat(product.originalPrice) >
                Number.parseFloat(product.currentPrice) && (
                <span className="text-lg text-muted line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
          </div>

          <p className="mt-6 leading-relaxed text-muted">
            Track this item on your watchlist to monitor price drops. Purchases
            through our link support the curation at no extra cost to you.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href={redirectUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              View Deal on SHEIN
            </a>
            <Link
              href={`/lookbook/${product.category ?? "y2k-aesthetic"}`}
              className="inline-flex h-12 items-center justify-center rounded-full border border-border px-8 text-sm transition-colors hover:border-foreground"
            >
              Back to lookbook
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
