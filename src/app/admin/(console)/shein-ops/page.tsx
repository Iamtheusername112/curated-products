import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { SheinImportPanel } from "@/components/admin/SheinImportPanel";
import { BulkUploadForm } from "@/components/BulkUploadForm";
import {
  PurgeCatalogButton,
  RefreshTestImagesButton,
} from "@/components/AdminCatalogTools";
import { getCatalogMetrics } from "@/lib/catalog-queries";
import {
  ensureDefaultFrontendCategories,
  getCategoryOptionsForUpload,
} from "@/lib/cms-queries";
import { PAGE_CONTAINER, PAGE_EYEBROW, PAGE_HEADING } from "@/lib/layout-classes";
export const metadata: Metadata = {
  title: "SHEIN Ops",
};

export default async function SheinOpsPage() {
  await ensureDefaultFrontendCategories();

  const [metrics, categoryOptions] = await Promise.all([
    getCatalogMetrics(),
    getCategoryOptionsForUpload(),
  ]);

  return (
    <div className={`${PAGE_CONTAINER} max-w-3xl py-12 md:py-16`}>
      <Suspense fallback={null}>
        <AdminNav />
      </Suspense>

      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm tracking-[0.25em] text-muted uppercase">Admin</p>
          <h1 className="mt-3 text-4xl font-light tracking-tight">SHEIN ops</h1>
          <p className="mt-4 max-w-2xl text-muted">
            Scrape live SHEIN category pages and push products directly into your
            Neon catalog — no affiliate CSV required.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          View storefront →
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <MetricCard label="Total products" value={metrics.totalProducts} />
        <MetricCard
          label="Broken affiliate URLs"
          value={metrics.brokenAffiliateUrls}
          warn={metrics.brokenAffiliateUrls > 0}
        />
      </div>

      <SheinImportPanel categoryOptions={categoryOptions} />

      <div className="mt-8 rounded-2xl border border-border bg-neutral-50 p-6">
        <h3 className="text-lg font-medium">Legacy CSV import</h3>
        <p className="mt-2 text-sm text-muted">
          Fallback when you already have a spreadsheet of curated products.
        </p>
        <div className="mt-4">
          <BulkUploadForm categoryOptions={categoryOptions} />
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-neutral-50 p-6">
        <h3 className="text-sm font-medium">Tips</h3>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-muted">
          <li>Use a category listing URL, not a single product page.</li>
          <li>
            Create or activate the matching slug under{" "}
            <Link href="/admin?tab=categories" className="underline underline-offset-4">
              Categories
            </Link>{" "}
            so the lookbook route renders on the storefront.
          </li>
          <li>
            If zero products are detected, SHEIN may be serving a JavaScript-only
            shell to server requests — try a different regional URL or category.
          </li>
        </ul>
        <RefreshTestImagesButton />
      </div>

      <div className="mt-8">
        <PurgeCatalogButton productCount={metrics.totalProducts} />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border p-5">
      <p className="text-sm text-muted">{label}</p>
      <p
        className={`mt-2 text-3xl font-light tracking-tight ${
          warn ? "text-red-600" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
