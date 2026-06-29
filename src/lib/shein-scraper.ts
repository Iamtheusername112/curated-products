import * as cheerio from "cheerio";
import { parsePrice } from "@/lib/affiliate";

export type ScrapedSheinProduct = {
  goodsId: string;
  goodsName: string;
  imageUrl: string;
  salePrice: string;
};

const SHEIN_HOST_PATTERN = /(^|\.)shein\.(com|co\.uk|de|fr|es|it|nl|ca|com\.au|com\.mx)$/i;
const PRODUCT_HREF_PATTERN = /-p-(\d{6,12})(?:\.html|[?#]|$)/i;
const RETAIL_PRICE_MULTIPLIER = 1.4;

const FETCH_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
};

export function detectSheinBotBlock(html: string): boolean {
  return (
    /risk\/challenge/i.test(html) ||
    /captcha_type/i.test(html) ||
    /geo.captcha/i.test(html) ||
    (html.includes("Shop Online Fashion | SHEIN") && !html.includes("-p-"))
  );
}

async function fetchHtmlWithOptionalRender(url: string): Promise<string> {
  const scraperApiKey = process.env.SCRAPER_API_KEY?.trim();

  if (scraperApiKey) {
    const proxyUrl = new URL("https://api.scraperapi.com/");
    proxyUrl.searchParams.set("api_key", scraperApiKey);
    proxyUrl.searchParams.set("url", url);
    proxyUrl.searchParams.set("render", "true");
    proxyUrl.searchParams.set("country_code", "us");

    const response = await fetch(proxyUrl.toString(), { cache: "no-store" });
    if (response.ok) {
      return response.text();
    }
  }

  const response = await fetch(url, {
    headers: FETCH_HEADERS,
    cache: "no-store",
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`SHEIN returned HTTP ${response.status} for the target URL`);
  }

  return response.text();
}

export function isValidSheinCategoryUrl(input: string): boolean {
  try {
    const url = new URL(input.trim());
    return SHEIN_HOST_PATTERN.test(url.hostname);
  } catch {
    return false;
  }
}

export function calculateRetailBenchmark(salePrice: string): string {
  const parsed = Number.parseFloat(salePrice);
  if (Number.isNaN(parsed)) return salePrice;
  return (parsed * RETAIL_PRICE_MULTIPLIER).toFixed(2);
}

export async function fetchSheinCategoryHtml(categoryUrl: string): Promise<string> {
  const normalizedUrl = categoryUrl.trim();

  if (!isValidSheinCategoryUrl(normalizedUrl)) {
    throw new Error("URL must be a valid SHEIN category or listing page");
  }

  const html = await fetchHtmlWithOptionalRender(normalizedUrl);

  if (!html || html.length < 500) {
    throw new Error("SHEIN response was empty or blocked. Try another category URL.");
  }

  if (detectSheinBotBlock(html)) {
    throw new Error(
      "SHEIN blocked this server request with an anti-bot challenge. Paste product URLs/IDs below instead, set SCRAPER_API_KEY for rendered scraping, or use the test CSV import."
    );
  }

  return html;
}

function normalizeImageUrl(src: string | undefined, baseUrl: string): string | null {
  if (!src?.trim()) return null;

  try {
    if (src.startsWith("//")) {
      return `https:${src}`;
    }

    return new URL(src, baseUrl).toString();
  } catch {
    return null;
  }
}

function addProduct(
  map: Map<string, ScrapedSheinProduct>,
  candidate: Partial<ScrapedSheinProduct>
) {
  const goodsId = candidate.goodsId?.trim();
  const goodsName = candidate.goodsName?.trim();
  const imageUrl = candidate.imageUrl?.trim();
  const parsedPrice = parsePrice(candidate.salePrice ?? null);

  if (!goodsId || !goodsName || !imageUrl || !parsedPrice) return;

  const existing = map.get(goodsId);
  if (existing) {
    map.set(goodsId, {
      goodsId,
      goodsName: goodsName.length > existing.goodsName.length ? goodsName : existing.goodsName,
      imageUrl: imageUrl.startsWith("http") ? imageUrl : existing.imageUrl,
      salePrice: parsedPrice,
    });
    return;
  }

  map.set(goodsId, {
    goodsId,
    goodsName,
    imageUrl,
    salePrice: parsedPrice,
  });
}

function parseEmbeddedJsonProducts(html: string, map: Map<string, ScrapedSheinProduct>) {
  const patterns = [
    /"goods_id"\s*:\s*"?(\d{6,12})"?\s*,[\s\S]{0,800}?"goods_name"\s*:\s*"([^"]+)"[\s\S]{0,800}?(?:"goods_img"\s*:\s*"([^"]+)"|"original_img"\s*:\s*"([^"]+)"|"detail_image"\s*:\s*\[\s*"([^"]+)")[\s\S]{0,400}?"salePrice"\s*:\s*\{[\s\S]{0,120}?"amount"\s*:\s*"([^"]+)"/gi,
    /"goodsId"\s*:\s*"?(\d{6,12})"?\s*,[\s\S]{0,800}?"goodsName"\s*:\s*"([^"]+)"[\s\S]{0,800}?"(?:goodsImg|goods_img|imageUrl)"\s*:\s*"([^"]+)"[\s\S]{0,400}?"(?:salePrice|retailPrice|price)"\s*:\s*"([^"]+)"/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      addProduct(map, {
        goodsId: match[1],
        goodsName: decodeJsonString(match[2] ?? ""),
        imageUrl: decodeJsonString(match[3] ?? match[4] ?? match[5] ?? ""),
        salePrice: match[6] ?? match[4],
      });
    }
  }

  const nextDataMatch = html.match(
    /<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i
  );

  if (nextDataMatch?.[1]) {
    try {
      const payload = JSON.parse(nextDataMatch[1]) as unknown;
      collectProductsFromUnknown(payload, map);
    } catch {
      // ignore malformed JSON payloads
    }
  }
}

function decodeJsonString(value: string): string {
  return value
    .replace(/\\u002F/g, "/")
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, " ")
    .trim();
}

function collectProductsFromUnknown(
  node: unknown,
  map: Map<string, ScrapedSheinProduct>,
  depth = 0
) {
  if (depth > 8 || node === null || node === undefined) return;

  if (Array.isArray(node)) {
    for (const item of node) {
      collectProductsFromUnknown(item, map, depth + 1);
    }
    return;
  }

  if (typeof node !== "object") return;

  const record = node as Record<string, unknown>;
  const goodsId = String(
    record.goods_id ?? record.goodsId ?? record.productId ?? record.sku ?? ""
  ).trim();

  if (/^\d{6,12}$/.test(goodsId)) {
    const goodsName = String(
      record.goods_name ?? record.goodsName ?? record.title ?? record.productName ?? ""
    ).trim();

    const imageCandidate = [
      record.goods_img,
      record.goodsImg,
      record.imageUrl,
      record.original_img,
      Array.isArray(record.detail_image) ? record.detail_image[0] : null,
    ].find((value) => typeof value === "string" && value.trim());

    const priceCandidate =
      typeof record.salePrice === "object" &&
      record.salePrice !== null &&
      "amount" in (record.salePrice as Record<string, unknown>)
        ? String((record.salePrice as Record<string, unknown>).amount ?? "")
        : String(
            record.salePrice ??
              record.retailPrice ??
              record.price ??
              record.usPrice ??
              ""
          );

    addProduct(map, {
      goodsId,
      goodsName,
      imageUrl: typeof imageCandidate === "string" ? imageCandidate : undefined,
      salePrice: priceCandidate,
    });
  }

  for (const value of Object.values(record)) {
    collectProductsFromUnknown(value, map, depth + 1);
  }
}

function parseDomProducts(html: string, map: Map<string, ScrapedSheinProduct>) {
  const $ = cheerio.load(html);
  const baseUrl = "https://www.shein.com";

  $("[data-mpid], [data-goods-id], [data-product-id]").each((_index, element) => {
    const el = $(element);
    const goodsId = String(
      el.attr("data-mpid") ?? el.attr("data-goods-id") ?? el.attr("data-product-id") ?? ""
    ).trim();

    const goodsName =
      el.attr("data-title") ??
      el.attr("title") ??
      el.attr("aria-label") ??
      el.find("[class*='goods-name'], [class*='goods_title'], .goods-title").first().text();

    const imageUrl =
      el.find("img").first().attr("src") ??
      el.find("img").first().attr("data-src") ??
      el.attr("data-image");

    const salePrice =
      el.attr("data-sale-price") ??
      el.find("[class*='sale-price'], [class*='price-sale'], .sale-price").first().text();

    addProduct(map, {
      goodsId,
      goodsName: goodsName?.trim(),
      imageUrl: normalizeImageUrl(imageUrl, baseUrl) ?? undefined,
      salePrice: salePrice?.trim(),
    });
  });

  $("a[href*='-p-']").each((_index, element) => {
    const el = $(element);
    const href = el.attr("href") ?? "";
    const idMatch = href.match(PRODUCT_HREF_PATTERN);
    if (!idMatch?.[1]) return;

    const container = el.closest("[class*='product'], [class*='goods'], li, article").first();
    const scope = container.length > 0 ? container : el;

    const goodsName =
      el.attr("aria-label") ??
      el.attr("title") ??
      scope.find("[class*='goods-name'], [class*='goods_title']").first().text() ??
      el.text();

    const imageUrl =
      scope.find("img").first().attr("src") ??
      scope.find("img").first().attr("data-src") ??
      el.find("img").first().attr("src");

    const salePrice =
      scope.find("[class*='sale-price'], [class*='price-sale']").first().text() ??
      scope.find("[class*='price']").first().text();

    addProduct(map, {
      goodsId: idMatch[1],
      goodsName: goodsName?.replace(/\s+/g, " ").trim(),
      imageUrl: normalizeImageUrl(imageUrl, baseUrl) ?? undefined,
      salePrice: salePrice?.trim(),
    });
  });
}

export function parseSheinProductsFromHtml(html: string): ScrapedSheinProduct[] {
  const map = new Map<string, ScrapedSheinProduct>();

  parseEmbeddedJsonProducts(html, map);
  parseDomProducts(html, map);

  return [...map.values()];
}

export async function scrapeSheinCategory(categoryUrl: string): Promise<ScrapedSheinProduct[]> {
  const html = await fetchSheinCategoryHtml(categoryUrl);
  const products = parseSheinProductsFromHtml(html);

  if (products.length === 0) {
    throw new Error(
      "No products were detected in the SHEIN page HTML. Category listings are JavaScript-rendered and often block server-side scraping. Use the Product import tab to paste individual product URLs/IDs, import JSON copied from your browser network tab, or upload the test CSV."
    );
  }

  return products;
}
