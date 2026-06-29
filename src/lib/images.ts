export const PRODUCT_PLACEHOLDER = "/images/no-product-image.svg";

const BLOCKED_IMAGE_HOSTS = [
  "images.unsplash.com",
  "unsplash.com",
  "picsum.photos",
  "fastly.picsum.photos",
  "img.ltwebstatic.com",
  "ltwebstatic.com",
];

export function isBlockedProductImageUrl(imageUrl: string | null | undefined): boolean {
  if (!imageUrl?.trim()) return true;
  if (imageUrl === PRODUCT_PLACEHOLDER) return true;

  if (imageUrl.startsWith("/uploads/")) {
    return false;
  }

  try {
    const hostname = new URL(imageUrl).hostname;
    return BLOCKED_IMAGE_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    );
  } catch {
    return !imageUrl.startsWith("/uploads/");
  }
}

export function isAdminProductImage(imageUrl: string | null | undefined): boolean {
  return Boolean(imageUrl?.trim()) && imageUrl.startsWith("/uploads/");
}

export function resolveProductImageUrl(
  _sheinProductId: string,
  imageUrl: string | null | undefined
): string {
  if (isAdminProductImage(imageUrl)) {
    return imageUrl!;
  }

  return PRODUCT_PLACEHOLDER;
}

export function resolveCategoryCoverUrl(
  imageUrl: string | null | undefined
): string | null {
  return isAdminProductImage(imageUrl) ? imageUrl! : null;
}

export function normalizeStoredCoverImageUrl(
  imageUrl: string | null | undefined
): string | null {
  return resolveCategoryCoverUrl(imageUrl);
}

export function resolveCoverImageForDisplay(
  storedCoverUrl: string | null | undefined,
  productCoverUrl?: string | null
): string | null {
  return (
    resolveCategoryCoverUrl(storedCoverUrl) ??
    resolveCategoryCoverUrl(productCoverUrl) ??
    null
  );
}
