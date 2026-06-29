import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { AdminNav } from "@/components/admin/AdminNav";
import { LookbookModeSettings } from "@/components/admin/LookbookModeSettings";
import {
  LookbookModeWorkspace,
  type AdminProduct,
} from "@/components/admin/ProductEditorForm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getFrontendCategoryBySlug } from "@/lib/cms-queries";
import { resolveStoredProductImages, getProductImagesByProductIds } from "@/lib/product-images";
import { PAGE_CONTAINER, PAGE_EYEBROW, PAGE_HEADING } from "@/lib/layout-classes";
type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = await getFrontendCategoryBySlug(slug);
  return {
    title: category ? `Admin · ${category.displayName}` : "Lookbook admin",
  };
}

export default async function AdminLookbookPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getFrontendCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const lookbookProducts = await db.query.products.findMany({
    where: eq(products.category, slug),
    orderBy: [desc(products.updatedAt)],
  });

  const imagesByProductId = await getProductImagesByProductIds(
    lookbookProducts.map((product) => product.id)
  );

  const productsWithImages: AdminProduct[] = lookbookProducts.map((product) => {
    const imageUrls =
      imagesByProductId.get(product.id) ??
      resolveStoredProductImages([], product.imageUrl);

    return {
      ...product,
      imageUrls,
    };
  });

  return (
    <div className={`${PAGE_CONTAINER} max-w-6xl py-12 md:py-16`}>
      <div className="mb-8">
        <Link href="/admin" className="text-sm text-muted hover:text-foreground">
          ← All shopping modes
        </Link>
        <p className={`mt-4 ${PAGE_EYEBROW}`}>Shopping mode</p>
        <h1 className={`mt-3 ${PAGE_HEADING}`}>{category.displayName}</h1>
        <p className="mt-3 text-sm text-muted">
          Add and edit products that appear under this lookbook on the live site.
        </p>
      </div>

      <Suspense fallback={null}>
        <AdminNav />
      </Suspense>

      <div className="space-y-8">
        <LookbookModeSettings category={category} />
        <LookbookModeWorkspace
          categorySlug={category.slug}
          categoryLabel={category.displayName}
          products={productsWithImages}
        />
      </div>
    </div>
  );
}
