import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { buildSheinAffiliateUrl, extractSheinProductId } from "@/lib/affiliate";

const AFFILIATE_COOKIE = "shein_affiliate_ref";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId: rawId } = await params;
  const productId = extractSheinProductId(rawId);

  if (!productId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let affiliateUrl: string;

  try {
    const product = await db.query.products.findFirst({
      where: eq(products.sheinProductId, productId),
      columns: { affiliateUrl: true },
    });

    affiliateUrl = product?.affiliateUrl
      ? product.affiliateUrl
      : buildSheinAffiliateUrl(productId);
  } catch {
    affiliateUrl = buildSheinAffiliateUrl(productId);
  }

  const response = NextResponse.redirect(affiliateUrl, { status: 302 });

  response.cookies.set(AFFILIATE_COOKIE, productId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}
