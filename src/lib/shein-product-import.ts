import { extractSheinProductId, parsePrice } from "@/lib/affiliate";
import { PRODUCT_PLACEHOLDER } from "@/lib/images";

export type ProductLineInput = {
  productId: string;
  title?: string;
  salePrice?: string;
  imageUrl?: string;
  affiliateUrl?: string;
};

function titleFromProductUrl(input: string): string | undefined {
  const match = input.match(/\/([^/?#]+)-p-\d{6,12}/i);
  if (!match?.[1]) return undefined;

  return decodeURIComponent(match[1])
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDelimitedLine(line: string): ProductLineInput | null {
  const parts = line.split("|").map((part) => part.trim());
  if (parts.length < 2) return null;

  const productId = extractSheinProductId(parts[0] ?? "");
  if (!productId) return null;

  return {
    productId,
    title: parts[1] || undefined,
    salePrice: parsePrice(parts[2]) ?? undefined,
    imageUrl: parts[3] || undefined,
    affiliateUrl: parts[4] || undefined,
  };
}

export function parseProductLines(raw: string): {
  rows: ProductLineInput[];
  errors: string[];
} {
  const rows: ProductLineInput[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const lineNo = index + 1;

    const delimited = parseDelimitedLine(line);
    if (delimited) {
      if (seen.has(delimited.productId)) continue;
      seen.add(delimited.productId);
      rows.push(delimited);
      continue;
    }

    const productId = extractSheinProductId(line);
    if (!productId) {
      errors.push(`Line ${lineNo}: could not parse a SHEIN product ID or URL`);
      continue;
    }

    if (seen.has(productId)) continue;
    seen.add(productId);

    rows.push({
      productId,
      title: titleFromProductUrl(line),
    });
  }

  return { rows, errors };
}

export function parseSheinJsonCatalog(raw: string): {
  rows: ProductLineInput[];
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    const list = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" &&
          parsed !== null &&
          Array.isArray((parsed as Record<string, unknown>).products)
        ? ((parsed as Record<string, unknown>).products as unknown[])
        : typeof parsed === "object" &&
            parsed !== null &&
            Array.isArray((parsed as Record<string, unknown>).info)
          ? ((parsed as Record<string, unknown>).info as unknown[])
          : [];

    if (list.length === 0) {
      return {
        rows: [],
        errors: ["JSON must be an array of products or an object with a products/info array"],
      };
    }

    const rows: ProductLineInput[] = [];
    const seen = new Set<string>();

    for (const item of list) {
      if (typeof item !== "object" || item === null) continue;
      const record = item as Record<string, unknown>;

      const productId = String(
        record.goods_id ?? record.goodsId ?? record.productId ?? record.id ?? ""
      ).trim();

      if (!/^\d{6,12}$/.test(productId) || seen.has(productId)) continue;
      seen.add(productId);

      const title = String(
        record.goods_name ?? record.goodsName ?? record.title ?? record.productName ?? ""
      ).trim();

      const imageUrl = String(
        record.goods_img ??
          record.goodsImg ??
          record.imageUrl ??
          (Array.isArray(record.detail_image) ? record.detail_image[0] : "") ??
          ""
      ).trim();

      const salePriceRaw =
        typeof record.salePrice === "object" &&
        record.salePrice !== null &&
        "amount" in (record.salePrice as Record<string, unknown>)
          ? String((record.salePrice as Record<string, unknown>).amount ?? "")
          : String(record.salePrice ?? record.retailPrice ?? record.price ?? "");

      rows.push({
        productId,
        title: title || undefined,
        salePrice: parsePrice(salePriceRaw) ?? undefined,
        imageUrl: imageUrl || undefined,
        affiliateUrl:
          typeof record.affiliateUrl === "string" ? record.affiliateUrl : undefined,
      });
    }

    return { rows, errors };
  } catch {
    return { rows: [], errors: ["Invalid JSON payload"] };
  }
}

export function productLinesToScrapedProducts(rows: ProductLineInput[]) {
  return rows.map((row) => ({
    goodsId: row.productId,
    goodsName: row.title?.trim() || `SHEIN find ${row.productId}`,
    imageUrl: row.imageUrl?.trim() || PRODUCT_PLACEHOLDER,
    salePrice: row.salePrice?.trim() || "9.99",
    affiliateUrl: row.affiliateUrl,
  }));
}
