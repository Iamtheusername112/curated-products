const BROKEN_IMAGE_HOSTS = ["images.unsplash.com", "unsplash.com", "picsum.photos", "fastly.picsum.photos"];

export function buildTestImageUrl(_sheinProductId: string): string {
  return `https://img.ltwebstatic.com/images3_pi/2023/04/22/1682132328cfa167169f129c340da4fc854d5587b4_thumbnail_600x.jpg`;
}

export function isBrokenProductImageUrl(imageUrl: string): boolean {
  try {
    const hostname = new URL(imageUrl).hostname;
    return BROKEN_IMAGE_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    );
  } catch {
    return true;
  }
}

export function resolveProductImageUrl(
  _sheinProductId: string,
  imageUrl: string
): string {
  if (isBrokenProductImageUrl(imageUrl)) {
    return buildTestImageUrl(_sheinProductId);
  }

  return imageUrl;
}
