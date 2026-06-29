"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { products } from "@/db/schema";
import {
  buildSheinAffiliateUrl,
  extractSheinProductId,
  parsePrice,
} from "@/lib/affiliate";
import { requireAdmin } from "@/lib/auth";
import { PRODUCT_PLACEHOLDER } from "@/lib/images";
import { slugifyCategory } from "@/lib/utils";
import type { BulkUploadResult } from "@/types/actions";

type CsvRow = {
  productId: string;
  title: string;
  imageUrl: string;
  salePrice: string | null;
  retailPrice: string | null;
  affiliateLink: string;
  category?: string;
};

const COLUMN_ALIASES: Record<keyof Omit<CsvRow, "category">, string[]> = {
  productId: ["product id", "productid", "sku", "goods id", "goods_id"],
  title: ["product name", "title", "name", "product title"],
  imageUrl: ["image url", "image", "img url", "picture url"],
  salePrice: ["sale price", "current price", "price", "sale_price"],
  retailPrice: ["retail price", "original price", "msrp", "retail_price"],
  affiliateLink: ["affiliate link", "affiliate url", "link", "affiliate_link"],
};

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function mapHeaders(headers: string[]): Partial<Record<keyof CsvRow, number>> {
  const mapping: Partial<Record<keyof CsvRow, number>> = {};

  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);

    for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as [
      keyof Omit<CsvRow, "category">,
      string[],
    ][]) {
      if (aliases.includes(normalized)) {
        mapping[field] = index;
      }
    }

    if (normalized === "category") {
      mapping.category = index;
    }
  });

  return mapping;
}

function parseCsvContent(csvContent: string): {
  rows: CsvRow[];
  errors: string[];
} {
  const lines = csvContent
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows: [], errors: ["CSV must include a header row and at least one data row"] };
  }

  const headers = parseCsvLine(lines[0]);
  const mapping = mapHeaders(headers);
  const requiredFields: (keyof Omit<CsvRow, "category">)[] = [
    "productId",
    "title",
    "imageUrl",
    "affiliateLink",
  ];

  const missing = requiredFields.filter((field) => mapping[field] === undefined);

  if (missing.length > 0) {
    return {
      rows: [],
      errors: [`Missing required columns: ${missing.join(", ")}`],
    };
  }

  const rows: CsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);

    const getValue = (field: keyof CsvRow): string => {
      const index = mapping[field];
      return index === undefined ? "" : (values[index] ?? "").trim();
    };

    const productId =
      extractSheinProductId(getValue("productId")) ??
      extractSheinProductId(getValue("affiliateLink"));

    if (!productId) {
      errors.push(`Row ${i + 1}: invalid or missing Product ID`);
      continue;
    }

    const title = getValue("title");
    const affiliateLink = getValue("affiliateLink");

    if (!title || !affiliateLink) {
      errors.push(`Row ${i + 1}: missing required field values`);
      continue;
    }

    rows.push({
      productId,
      title,
      imageUrl: PRODUCT_PLACEHOLDER,
      salePrice: parsePrice(getValue("salePrice")),
      retailPrice: parsePrice(getValue("retailPrice")),
      affiliateLink,
      category: getValue("category") ? slugifyCategory(getValue("category")) : undefined,
    });
  }

  return { rows, errors };
}

export async function bulkUploadProducts(
  _prevState: BulkUploadResult,
  formData: FormData
): Promise<BulkUploadResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      inserted: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : "Unauthorized"],
    };
  }

  const file = formData.get("file");
  const defaultCategory = formData.get("category");

  if (!(file instanceof File)) {
    return {
      success: false,
      inserted: 0,
      skipped: 0,
      errors: ["No CSV file provided"],
    };
  }

  const csvContent = await file.text();
  const { rows, errors } = parseCsvContent(csvContent);

  if (rows.length === 0) {
    return {
      success: false,
      inserted: 0,
      skipped: 0,
      errors: errors.length > 0 ? errors : ["No valid rows found in CSV"],
    };
  }

  const fallbackCategory =
    typeof defaultCategory === "string" && defaultCategory.trim()
      ? slugifyCategory(defaultCategory)
      : "uncategorized";

  const values = rows.map((row) => ({
    sheinProductId: row.productId,
    title: row.title,
    imageUrl: row.imageUrl,
    currentPrice: row.salePrice,
    originalPrice: row.retailPrice,
    rawProductUrl: `https://www.shein.com/p-${row.productId}.html`,
    affiliateUrl: buildSheinAffiliateUrl(row.productId, row.affiliateLink),
    category: row.category ?? fallbackCategory,
    isTrending: true,
    updatedAt: new Date(),
  }));

  try {
    await db
      .insert(products)
      .values(values)
      .onConflictDoUpdate({
        target: products.sheinProductId,
        set: {
          title: sql`excluded.title`,
          imageUrl: sql`excluded.image_url`,
          currentPrice: sql`excluded.current_price`,
          originalPrice: sql`excluded.original_price`,
          rawProductUrl: sql`excluded.raw_product_url`,
          affiliateUrl: sql`excluded.affiliate_url`,
          category: sql`excluded.category`,
          isTrending: sql`excluded.is_trending`,
          updatedAt: sql`excluded.updated_at`,
        },
      });

    revalidatePath("/");
    revalidatePath("/lookbook", "layout");
    revalidatePath("/admin");
    revalidatePath("/dashboard/admin");

    return {
      success: true,
      inserted: rows.length,
      skipped: errors.length,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      inserted: 0,
      skipped: rows.length,
      errors: [
        error instanceof Error ? error.message : "Database upsert failed",
        ...errors,
      ],
    };
  }
}
