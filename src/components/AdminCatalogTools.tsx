"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
  purgeAllProductsAction,
  refreshTestProductImagesAction,
} from "@/app/actions/admin";
import type { PurgeCatalogResult, RefreshTestImagesResult } from "@/types/actions";

const refreshInitialState: RefreshTestImagesResult = {
  success: false,
  updatedCount: 0,
};

const purgeInitialState: PurgeCatalogResult = {
  success: false,
  deletedCount: 0,
};

export function RefreshTestImagesButton() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    refreshTestProductImagesAction,
    refreshInitialState
  );

  useEffect(() => {
    if (state.success && state.updatedCount > 0) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="mt-4">
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background disabled:opacity-50"
        >
          {isPending ? "Fixing images..." : "Fix broken test images"}
        </button>
      </form>

      {state.success && state.updatedCount > 0 && (
        <p className="mt-3 text-sm text-green-700">
          Updated images for {state.updatedCount} product
          {state.updatedCount === 1 ? "" : "s"}.
        </p>
      )}

      {state.success && state.updatedCount === 0 && !isPending && (
        <p className="mt-3 text-sm text-muted">
          No products with broken placeholder images found.
        </p>
      )}

      {state.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
    </div>
  );
}

export function PurgeCatalogButton({ productCount }: { productCount: number }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    purgeAllProductsAction,
    purgeInitialState
  );

  useEffect(() => {
    if (state.success && state.deletedCount > 0) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
      <h2 className="text-lg font-medium text-red-900">Purge test catalog</h2>
      <p className="mt-2 text-sm text-red-900/80">
        Remove every product from your Neon database ({productCount} currently
        stored). Watchlist entries for those products are deleted automatically.
        Your CSV file on your computer is not affected — delete that locally if
        you no longer need it.
      </p>

      <form
        action={formAction}
        className="mt-4"
        onSubmit={(event) => {
          const confirmed = window.confirm(
            `Delete all ${productCount} product${productCount === 1 ? "" : "s"} from the database?\n\nThis removes every imported item and clears all watchlist entries tied to those products. This cannot be undone.`
          );

          if (!confirmed) {
            event.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          disabled={isPending || productCount === 0}
          className="inline-flex h-11 items-center justify-center rounded-full border border-red-300 bg-white px-6 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Deleting..." : "Delete all products from database"}
        </button>
      </form>

      {productCount === 0 && (
        <p className="mt-3 text-sm text-muted">No products in the database.</p>
      )}

      {state.success && state.deletedCount > 0 && (
        <p className="mt-3 text-sm text-green-700">
          Removed {state.deletedCount} product{state.deletedCount === 1 ? "" : "s"}{" "}
          from the database.
        </p>
      )}

      {state.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
