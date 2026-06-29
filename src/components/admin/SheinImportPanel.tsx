"use client";

import { useActionState } from "react";
import {
  syncFromProductLinesAction,
  syncFromSheinJsonAction,
  syncFromSheinUrlAction,
} from "@/app/actions/shein-url-sync";
import type { SheinUrlSyncResult } from "@/types/actions";
import type { CategoryOption } from "@/lib/cms-queries";

const initialState: SheinUrlSyncResult = {
  success: false,
  synced: 0,
  skipped: 0,
  errors: [],
};

type SheinImportPanelProps = {
  categoryOptions: CategoryOption[];
};

function ResultMessages({ state }: { state: SheinUrlSyncResult }) {
  return (
    <>
      {state.success && state.synced > 0 && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Synced {state.synced} product{state.synced === 1 ? "" : "s"}
          {state.categorySlug ? (
            <>
              {" "}
              into{" "}
              <code className="rounded bg-white/80 px-1.5 py-0.5">{state.categorySlug}</code>
            </>
          ) : null}
          .
          {state.skipped > 0 && ` Skipped ${state.skipped} line(s).`}
        </div>
      )}

      {state.errors.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-red-600">
          {state.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </>
  );
}

function CategoryField({
  categoryOptions,
  defaultSlug,
  id = "categorySlug",
}: {
  categoryOptions: CategoryOption[];
  defaultSlug: string;
  id?: string;
}) {
  if (categoryOptions.length > 0) {
    return (
      <select
        id={id}
        name="categorySlug"
        defaultValue={defaultSlug}
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
      >
        {categoryOptions.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      id={id}
      name="categorySlug"
      required
      placeholder="y2k-aesthetic"
      className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
    />
  );
}

export function SheinImportPanel({ categoryOptions }: SheinImportPanelProps) {
  const defaultSlug = categoryOptions[0]?.slug ?? "y2k-aesthetic";
  const [productState, productAction, productPending] = useActionState(
    syncFromProductLinesAction,
    initialState
  );
  const [urlState, urlAction, urlPending] = useActionState(
    syncFromSheinUrlAction,
    initialState
  );
  const [jsonState, jsonAction, jsonPending] = useActionState(
    syncFromSheinJsonAction,
    initialState
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
        <p className="font-medium">SHEIN blocks automated category scraping</p>
        <p className="mt-2">
          Category pages are JavaScript-rendered and usually return an anti-bot page to
          servers. The recommended workflow is to paste individual product URLs/IDs from
          your browser while browsing shein.com.
        </p>
      </div>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="text-lg font-medium">Import product URLs / IDs</h2>
        <p className="mt-2 text-sm text-muted">
          Paste one item per line. Supports product URLs, product IDs, or full lines:
          <code className="mx-1 rounded bg-neutral-100 px-1.5 py-0.5 text-xs">
            id|title|price|imageUrl
          </code>
        </p>

        <form action={productAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="product-categorySlug" className="mb-2 block text-sm">
              Category slug
            </label>
            <CategoryField
              id="product-categorySlug"
              categoryOptions={categoryOptions}
              defaultSlug={defaultSlug}
            />
          </div>

          <div>
            <label htmlFor="productLines" className="mb-2 block text-sm">
              Product lines
            </label>
            <textarea
              id="productLines"
              name="productLines"
              rows={8}
              required
              placeholder={
                "https://us.shein.com/example-product-p-47977641.html\n47977641|ROMWE Y2K Tube Top|11.99|https://img.ltwebstatic.com/..."
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <SubmitButton pending={productPending} label="Import products" />
        </form>

        <ResultMessages state={productState} />
      </section>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="text-lg font-medium">Category URL (experimental)</h2>
        <p className="mt-2 text-sm text-muted">
          May work only if you configure{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">
            SCRAPER_API_KEY
          </code>{" "}
          for rendered HTML fetching.
        </p>

        <form action={urlAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="url-categorySlug" className="mb-2 block text-sm">
              Category slug
            </label>
            <select
              id="url-categorySlug"
              name="categorySlug"
              defaultValue={defaultSlug}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
            >
              {categoryOptions.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="categoryUrl" className="mb-2 block text-sm">
              Target SHEIN URL
            </label>
            <input
              id="categoryUrl"
              name="categoryUrl"
              type="url"
              placeholder="https://www.shein.com/Women-Clothing-c-2030.html"
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
            />
          </div>

          <SubmitButton pending={urlPending} label="Fetch & Sync Products" />
        </form>

        <ResultMessages state={urlState} />
      </section>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="text-lg font-medium">Paste JSON from browser</h2>
        <p className="mt-2 text-sm text-muted">
          In Chrome DevTools → Network, find a SHEIN product list response, copy the JSON
          array, and paste it here.
        </p>

        <form action={jsonAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="json-categorySlug" className="mb-2 block text-sm">
              Category slug
            </label>
            <select
              id="json-categorySlug"
              name="categorySlug"
              defaultValue={defaultSlug}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
            >
              {categoryOptions.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="jsonPayload" className="mb-2 block text-sm">
              JSON payload
            </label>
            <textarea
              id="jsonPayload"
              name="jsonPayload"
              rows={8}
              placeholder='[{"goods_id":"47977641","goods_name":"...","goods_img":"...","salePrice":{"amount":"11.99"}}]'
              className="w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs"
            />
          </div>

          <SubmitButton pending={jsonPending} label="Import JSON catalog" />
        </form>

        <ResultMessages state={jsonState} />
      </section>
    </div>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background disabled:opacity-50"
    >
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
          Working...
        </>
      ) : (
        label
      )}
    </button>
  );
}
