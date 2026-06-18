import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProductCount } from "@/lib/catalog-queries";
import {
  PurgeCatalogButton,
  RefreshTestImagesButton,
} from "@/components/AdminCatalogTools";
import { BulkUploadForm } from "@/components/BulkUploadForm";

export const metadata: Metadata = {
  title: "Admin — Bulk Upload",
};

export default async function AdminDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const adminIds =
    process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()).filter(Boolean) ??
    [];

  if (adminIds.length > 0 && !adminIds.includes(userId)) {
    redirect("/dashboard");
  }

  const productCount = await getProductCount();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10">
        <p className="text-sm tracking-[0.25em] text-muted uppercase">Admin</p>
        <h1 className="mt-3 text-4xl font-light tracking-tight">Product sync</h1>
        <p className="mt-4 text-muted">
          Import SHEIN affiliate CSV feeds. Products upsert on{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">
            sheinProductId
          </code>
          .
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-border bg-neutral-50 p-6">
        <h2 className="text-lg font-medium">Test CSV</h2>
        <p className="mt-2 text-sm text-muted">
          Download the sample catalog with 8 real SHEIN products across lookbook
          categories. Uses official SHEIN product photos from{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5">img.ltwebstatic.com</code>.
        </p>
        <a
          href="/samples/shein-test-catalog.csv"
          download="shein-test-catalog.csv"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-border bg-white px-6 text-sm font-medium transition-colors hover:border-foreground"
        >
          Download test CSV
        </a>
        <RefreshTestImagesButton />
      </div>

      <BulkUploadForm />

      <div className="mt-8">
        <PurgeCatalogButton productCount={productCount} />
      </div>

      <div className="mt-8 rounded-2xl bg-neutral-50 p-6 text-sm text-muted">
        <p className="font-medium text-foreground">Expected CSV columns</p>
        <ul className="mt-3 list-inside list-disc space-y-1">
          <li>Product ID</li>
          <li>Product Name</li>
          <li>Image URL</li>
          <li>Sale Price</li>
          <li>Retail Price</li>
          <li>Affiliate Link</li>
          <li>Category (optional)</li>
        </ul>
      </div>
    </div>
  );
}
