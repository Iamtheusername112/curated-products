"use client";

import { useActionState } from "react";
import { bulkUploadProducts } from "@/app/actions/bulk-upload";
import type { BulkUploadResult } from "@/types/actions";
import type { CategoryOption } from "@/lib/cms-queries";

const initialState: BulkUploadResult = {
  success: false,
  inserted: 0,
  skipped: 0,
  errors: [],
};

type BulkUploadFormProps = {
  categoryOptions: CategoryOption[];
};

export function BulkUploadForm({ categoryOptions }: BulkUploadFormProps) {
  const [state, formAction, isPending] = useActionState(
    bulkUploadProducts,
    initialState
  );

  return (
    <div className="rounded-2xl border border-border p-6">
      <h2 className="text-lg font-medium">Bulk CSV Upload</h2>
      <p className="mt-2 text-sm text-muted">
        Upload SHEIN affiliate feed CSV with columns: Product ID, Product Name,
        Image URL, Sale Price, Retail Price, Affiliate Link.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="category" className="mb-2 block text-sm">
            Default category
          </label>
          <select
            id="category"
            name="category"
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
            defaultValue={categoryOptions[0]?.slug ?? "y2k-aesthetic"}
          >
            {categoryOptions.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="file" className="mb-2 block text-sm">
            CSV file
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-sm file:text-background"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background disabled:opacity-50"
        >
          {isPending ? "Uploading..." : "Upload & sync"}
        </button>
      </form>

      {state.inserted > 0 && (
        <p className="mt-4 text-sm text-green-700">
          Synced {state.inserted} product{state.inserted === 1 ? "" : "s"}.
          {state.skipped > 0 && ` Skipped ${state.skipped} row(s).`}
        </p>
      )}

      {state.errors.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-red-600">
          {state.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
