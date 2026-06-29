import Image from "next/image";
import Link from "next/link";
import { getCategoryMoodLine } from "@/lib/category-moods";
import { formatPrice } from "@/lib/affiliate";
import { resolveCoverImageForDisplay } from "@/lib/images";

type LookbookCategoryCardProps = {
  category: { slug: string; displayName: string; description?: string | null };
  coverImage: string | null;
  productCount?: number;
  fromPrice?: string | null;
  className?: string;
};

export function LookbookCategoryCard({
  category,
  coverImage,
  productCount = 0,
  fromPrice = null,
  className = "",
}: LookbookCategoryCardProps) {
  const moodLine =
    category.description?.trim() || getCategoryMoodLine(category.slug);
  const safeCoverImage = resolveCoverImageForDisplay(coverImage);

  return (
    <Link
      href={`/lookbook/${category.slug}`}
      className={`group relative flex aspect-[4/5] items-end overflow-hidden rounded-2xl border border-border bg-neutral-100 p-5 transition-shadow hover:shadow-xl ${className}`}
    >
      {safeCoverImage ? (
        <Image
          src={safeCoverImage}
          alt={category.displayName}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 transition-opacity group-hover:from-black/90" />
      <div className="relative w-full">
        <p className="text-xs tracking-[0.2em] text-white/75 uppercase">Lookbook</p>
        <h3 className="mt-1 text-lg font-light text-white md:text-xl">
          {category.displayName}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/70">
          {moodLine}
        </p>
        {(productCount > 0 || fromPrice) && (
          <p className="mt-2 text-xs text-white/60">
            {productCount > 0 && `${productCount} pieces`}
            {productCount > 0 && fromPrice && " · "}
            {fromPrice && `From ${formatPrice(fromPrice)}`}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium tracking-wide text-white opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
          Shop the look
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
