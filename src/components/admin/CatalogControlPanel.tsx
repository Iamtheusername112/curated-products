import type { CatalogMetrics } from "@/lib/catalog-queries";
import Link from "next/link";
import {
  PurgeCatalogButton,
  RefreshTestImagesButton,
} from "@/components/AdminCatalogTools";

type CatalogControlPanelProps = {
  metrics: CatalogMetrics;
};

export function CatalogControlPanel({ metrics }: CatalogControlPanelProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-light tracking-tight">Catalog health</h2>
        <p className="mt-2 text-sm text-muted">
          Monitor synced inventory and maintenance tools. Product ingestion now runs
          through the SHEIN URL scraper.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-neutral-950 px-6 py-5 text-white">
        <p className="text-sm font-medium">Primary ingestion</p>
        <p className="mt-2 text-sm text-white/70">
          Paste a live SHEIN category URL and sync products directly into Neon.
        </p>
        <Link
          href="/admin/shein-ops"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-medium text-neutral-950"
        >
          Open SHEIN ops
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total products" value={metrics.totalProducts} />
        <MetricCard label="Trending flagged" value={metrics.trendingProducts} />
        <MetricCard
          label="Broken affiliate URLs"
          value={metrics.brokenAffiliateUrls}
          warn={metrics.brokenAffiliateUrls > 0}
        />
        <MetricCard
          label="Placeholder images"
          value={metrics.brokenImageUrls}
          warn={metrics.brokenImageUrls > 0}
        />
      </div>

      <div className="rounded-2xl border border-border bg-neutral-50 p-6">
        <h3 className="text-lg font-medium">Catalog maintenance</h3>
        <p className="mt-2 text-sm text-muted">
          Repair broken placeholder images from older imports.
        </p>
        <RefreshTestImagesButton />
      </div>

      <PurgeCatalogButton productCount={metrics.totalProducts} />
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
