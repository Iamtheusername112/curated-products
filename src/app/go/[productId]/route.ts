import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  buildSheinAffiliateUrl,
  extractSheinProductId,
  resolveAffiliateDestination,
} from "@/lib/affiliate";

const AFFILIATE_COOKIE = "shein_affiliate_ref";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type ProductRedirectRecord = {
  affiliateUrl: string;
  rawProductUrl: string | null;
  sheinProductId: string;
};

async function findProductForRedirect(
  rawId: string
): Promise<ProductRedirectRecord | null> {
  const numericId = Number.parseInt(rawId, 10);
  if (!Number.isNaN(numericId) && String(numericId) === rawId) {
    const byCatalogId = await db.query.products.findFirst({
      where: eq(products.id, numericId),
      columns: {
        affiliateUrl: true,
        rawProductUrl: true,
        sheinProductId: true,
      },
    });

    if (byCatalogId) {
      return byCatalogId;
    }
  }

  const bySheinProductId = await db.query.products.findFirst({
    where: eq(products.sheinProductId, rawId),
    columns: {
      affiliateUrl: true,
      rawProductUrl: true,
      sheinProductId: true,
    },
  });

  if (bySheinProductId) {
    return bySheinProductId;
  }

  const extractedSheinId = extractSheinProductId(rawId);
  if (extractedSheinId && extractedSheinId !== rawId) {
    const byExtractedSheinId = await db.query.products.findFirst({
      where: eq(products.sheinProductId, extractedSheinId),
      columns: {
        affiliateUrl: true,
        rawProductUrl: true,
        sheinProductId: true,
      },
    });

    if (byExtractedSheinId) {
      return byExtractedSheinId;
    }
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId: rawId } = await params;

  let affiliateUrl: string;
  let cookieRef = rawId;

  try {
    const product = await findProductForRedirect(rawId);

    if (product) {
      affiliateUrl = resolveAffiliateDestination(
        product.affiliateUrl,
        product.rawProductUrl,
        product.sheinProductId
      );
      cookieRef = product.sheinProductId;
    } else {
      const extractedSheinId = extractSheinProductId(rawId);
      if (!extractedSheinId) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      affiliateUrl = buildSheinAffiliateUrl(extractedSheinId);
      cookieRef = extractedSheinId;
    }
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.redirect(affiliateUrl, { status: 302 });

  response.cookies.set(AFFILIATE_COOKIE, cookieRef, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}
