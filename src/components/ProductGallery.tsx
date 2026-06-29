"use client";

import Image from "next/image";
import { useState } from "react";
import { PRODUCT_PLACEHOLDER } from "@/lib/images";

type ProductGalleryProps = {
  images: string[];
  alt: string;
  priority?: boolean;
};

export function ProductGallery({
  images,
  alt,
  priority = false,
}: ProductGalleryProps) {
  const galleryImages = images.filter((url) => url.startsWith("/uploads/"));
  const [activeIndex, setActiveIndex] = useState(0);

  if (galleryImages.length === 0) {
    return (
      <div className="flex aspect-[3/4] flex-col items-center justify-center bg-neutral-100 px-4 text-center">
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

  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];

  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        <Image
          key={activeImage}
          src={activeImage}
          alt={`${alt} — photo ${activeIndex + 1} of ${galleryImages.length}`}
          fill
          priority={priority && activeIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {galleryImages.length > 1 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs text-muted">
            {activeIndex + 1} / {galleryImages.length}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {galleryImages.map((src, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={src}
                  type="button"
                  aria-label={`View photo ${index + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => setActiveIndex(index)}
                  className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border transition-colors ${
                    isActive
                      ? "border-foreground ring-2 ring-foreground/20"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
