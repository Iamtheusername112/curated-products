import Image from "next/image";
import {
  PRODUCT_PLACEHOLDER,
  resolveProductImageUrl,
} from "@/lib/images";

type ProductImageProps = {
  sheinProductId: string;
  imageUrl: string | null | undefined;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

export function ProductImage({
  sheinProductId,
  imageUrl,
  alt,
  fill = true,
  sizes,
  className = "object-cover",
  priority = false,
}: ProductImageProps) {
  const src = resolveProductImageUrl(sheinProductId, imageUrl);
  const isPlaceholder = src === PRODUCT_PLACEHOLDER;

  if (isPlaceholder) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-100 px-4 text-center">
        <Image
          src={PRODUCT_PLACEHOLDER}
          alt=""
          width={120}
          height={120}
          className="opacity-70"
          aria-hidden
        />
        <p className="mt-3 text-xs text-muted">Image pending — add in admin</p>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
