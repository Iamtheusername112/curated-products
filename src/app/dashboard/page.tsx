import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { RemoveWatchlistButton } from "@/components/RemoveWatchlistButton";
import { db } from "@/db";
import { userWatchlist, type Product } from "@/db/schema";
import {
  buildInternalRedirectUrl,
  formatPrice,
} from "@/lib/affiliate";
import { resolveProductImageUrl } from "@/lib/images";

type WatchlistEntryWithProduct = {
  id: number;
  userId: string;
  productId: number;
  targetPrice: string | null;
  createdAt: Date;
  product: Product | null;
};

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let entries: WatchlistEntryWithProduct[] = [];

  try {
    entries = await db.query.userWatchlist.findMany({
      where: eq(userWatchlist.userId, userId),
      with: { product: true },
      orderBy: [desc(userWatchlist.createdAt)],
    });
  } catch {
    entries = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12">
        <p className="text-sm tracking-[0.25em] text-muted uppercase">Account</p>
        <h1 className="mt-3 text-4xl font-light tracking-tight">Your watchlist</h1>
        <p className="mt-4 max-w-xl text-muted">
          Items you save here are tracked for price drops. We&apos;ll expand alerts
          in a future release — for now, check back anytime.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-muted">Your watchlist is empty.</p>
          <Link
            href="/lookbook/y2k-aesthetic"
            className="mt-4 inline-flex text-sm underline underline-offset-4"
          >
            Browse lookbooks
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border">
          {entries.map((entry) => {
            const product = entry.product;
            if (!product) return null;

            const redirectUrl = buildInternalRedirectUrl(product.sheinProductId);
            const imageUrl = resolveProductImageUrl(
              product.sheinProductId,
              product.imageUrl
            );

            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-4 md:gap-6 md:p-6"
              >
                <Link
                  href={`/product/${product.id}`}
                  className="relative h-20 w-16 shrink-0 overflow-hidden bg-neutral-100 md:h-24 md:w-20"
                >
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link href={`/product/${product.id}`}>
                    <h2 className="truncate text-sm font-medium md:text-base">
                      {product.title}
                    </h2>
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    Current: {formatPrice(product.currentPrice)}
                    {entry.targetPrice && (
                      <> · Target: {formatPrice(entry.targetPrice)}</>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="hidden rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-foreground sm:inline-flex"
                  >
                    View Deal
                  </a>
                  <RemoveWatchlistButton watchlistId={entry.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
