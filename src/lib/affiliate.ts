const SHEIN_PRODUCT_ID_PATTERN = /^\d{6,12}$/;
const SHEIN_URL_PATTERNS = [
  /\/p-(\d+)\.html/i,
  /\/product\/(\d+)/i,
  /goods_id=(\d+)/i,
  /[?&]id=(\d+)/i,
];

export function extractSheinProductId(input: string): string | null {
  const trimmed = input.trim();

  if (SHEIN_PRODUCT_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);

    for (const pattern of SHEIN_URL_PATTERNS) {
      const match = url.pathname.match(pattern) ?? url.search.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function isValidSheinProductId(productId: string): boolean {
  return SHEIN_PRODUCT_ID_PATTERN.test(productId);
}

export function buildSheinAffiliateUrl(
  productIdOrUrl: string,
  existingAffiliateUrl?: string | null
): string {
  if (existingAffiliateUrl?.trim()) {
    return normalizeAffiliateUrl(existingAffiliateUrl.trim(), productIdOrUrl);
  }

  const productId = extractSheinProductId(productIdOrUrl);

  if (!productId) {
    throw new Error("Invalid SHEIN product URL or ID");
  }

  const affiliateId = process.env.SHEIN_AFFILIATE_ID;
  const subId = process.env.SHEIN_AFFILIATE_SUB_ID ?? "shein_curator";

  if (!affiliateId) {
    return `https://www.shein.com/p-${productId}.html`;
  }

  const baseUrl = new URL(`https://www.shein.com/p-${productId}.html`);
  baseUrl.searchParams.set("affiliate_id", affiliateId);
  baseUrl.searchParams.set("sub_id", subId);
  baseUrl.searchParams.set("utm_source", "affiliate");
  baseUrl.searchParams.set("utm_medium", "curator");
  baseUrl.searchParams.set("utm_campaign", subId);

  return baseUrl.toString();
}

function normalizeAffiliateUrl(
  affiliateUrl: string,
  productIdOrUrl: string
): string {
  try {
    const url = new URL(affiliateUrl);
    const productId = extractSheinProductId(productIdOrUrl);

    if (productId && !url.pathname.includes(productId)) {
      url.pathname = `/p-${productId}.html`;
    }

    const affiliateId = process.env.SHEIN_AFFILIATE_ID;
    const subId = process.env.SHEIN_AFFILIATE_SUB_ID ?? "shein_curator";

    if (affiliateId && !url.searchParams.has("affiliate_id")) {
      url.searchParams.set("affiliate_id", affiliateId);
    }

    if (subId && !url.searchParams.has("sub_id")) {
      url.searchParams.set("sub_id", subId);
    }

    return url.toString();
  } catch {
    return affiliateUrl;
  }
}

export function buildInternalRedirectUrl(
  productId: string | number,
  baseUrl?: string
): string {
  const id = String(productId);
  const origin = baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${origin}/go/${id}`;
}

export function parsePrice(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const cleaned = String(value).replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(cleaned);

  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }

  return parsed.toFixed(2);
}

export function calculateDiscountPercent(
  currentPrice: string | null,
  originalPrice: string | null
): number | null {
  if (!currentPrice || !originalPrice) {
    return null;
  }

  const current = Number.parseFloat(currentPrice);
  const original = Number.parseFloat(originalPrice);

  if (original <= 0 || current >= original) {
    return null;
  }

  return Math.round(((original - current) / original) * 100);
}

export function formatPrice(price: string | null): string {
  if (!price) {
    return "—";
  }

  return `$${Number.parseFloat(price).toFixed(2)}`;
}
