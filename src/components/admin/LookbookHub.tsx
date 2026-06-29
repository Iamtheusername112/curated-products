"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
  createFrontendCategory,
  deleteFrontendCategoryAction,
  toggleCategoryActiveAction,
} from "@/app/actions/categories";
import type { FrontendCategory } from "@/db/schema";
import type { CategoryActionResult, CategoryFormState } from "@/types/actions";

const createInitial: CategoryFormState = { success: false };
const actionInitial: CategoryActionResult = { success: false };

type LookbookHubProps = {
  categories: FrontendCategory[];
  productCounts: Record<string, number>;
};

function ShoppingModeCard({
  category,
  productCount,
}: {
  category: FrontendCategory;
  productCount: number;
}) {
  const router = useRouter();
  const [toggleState, toggleAction, isToggling] = useActionState(
    toggleCategoryActiveAction,
    actionInitial
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteFrontendCategoryAction,
    actionInitial
  );

  useEffect(() => {
    if (toggleState.success || deleteState.success) {
      router.refresh();
    }
  }, [toggleState.success, deleteState.success, router]);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{category.displayName}</p>
          <p className="mt-1 text-xs tracking-wide text-muted uppercase">
            /lookbook/{category.slug}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${
            category.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-neutral-100 text-muted"
          }`}
        >
          {category.isActive ? "Live" : "Hidden"}
        </span>
      </div>

      {category.description ? (
        <p className="mt-3 line-clamp-2 text-sm text-muted">{category.description}</p>
      ) : (
        <p className="mt-3 text-sm text-muted">No description yet</p>
      )}

      <p className="mt-4 text-sm">
        <span className="font-medium">{productCount}</span> products · order{" "}
        {category.displayOrder}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/admin/lookbooks/${category.slug}`}
          className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-xs font-medium text-background"
        >
          Manage products
        </Link>
        {category.isActive ? (
          <Link
            href={`/lookbook/${category.slug}`}
            className="inline-flex h-9 items-center rounded-full border border-border px-4 text-xs"
          >
            View live
          </Link>
        ) : null}
        <form action={toggleAction}>
          <input type="hidden" name="id" value={category.id} />
          <input type="hidden" name="isActive" value={String(!category.isActive)} />
          <button
            type="submit"
            disabled={isToggling}
            className="inline-flex h-9 items-center rounded-full border border-border px-4 text-xs disabled:opacity-50"
          >
            {category.isActive ? "Hide" : "Show"}
          </button>
        </form>
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (
              !window.confirm(
                `Delete "${category.displayName}"?\n\nThe lookbook page will be removed. Products in this mode stay in the database but won't appear until reassigned.`
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={category.id} />
          <button
            type="submit"
            disabled={isDeleting}
            className="inline-flex h-9 items-center rounded-full border border-red-200 px-4 text-xs text-red-600 disabled:opacity-50"
          >
            Delete
          </button>
        </form>
      </div>

      {(toggleState.error || deleteState.error) && (
        <p className="mt-3 text-xs text-red-600">
          {toggleState.error ?? deleteState.error}
        </p>
      )}
    </div>
  );
}

export function LookbookHub({ categories, productCounts }: LookbookHubProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createFrontendCategory,
    createInitial
  );

  useEffect(() => {
    if (state.success && state.slug) {
      router.push(`/admin/lookbooks/${state.slug}`);
    }
  }, [state.success, state.slug, router]);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-border bg-neutral-50 p-6">
        <h2 className="text-lg font-medium">Create a new shopping mood</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Add any vibe you want — Coquette, Cottagecore, Gym Girl, etc. It appears on
          the homepage and gets its own lookbook page automatically.
        </p>

        <form action={formAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="new-displayName" className="mb-2 block text-sm font-medium">
              Mood name
            </label>
            <input
              id="new-displayName"
              name="displayName"
              required
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
              placeholder="Coquette Core"
            />
          </div>
          <div>
            <label htmlFor="new-slug" className="mb-2 block text-sm font-medium">
              URL slug (optional)
            </label>
            <input
              id="new-slug"
              name="slug"
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
              placeholder="coquette-core"
            />
            <p className="mt-1 text-xs text-muted">
              Auto-generated from the name if left blank
            </p>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="new-description" className="mb-2 block text-sm font-medium">
              Short description
            </label>
            <textarea
              id="new-description"
              name="description"
              rows={3}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
              placeholder="Soft bows, blush tones, and romantic silhouettes..."
            />
          </div>
          {state.error ? (
            <p className="md:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create shopping mood"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-light tracking-tight">
          Your shopping moods ({categories.length})
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Y2K Aesthetic, Minimalist Office, and the rest — open any mode to add products,
          or hide moods you are not using yet.
        </p>

        {categories.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted">
            No shopping moods yet. Create your first one above.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <ShoppingModeCard
                key={category.id}
                category={category}
                productCount={productCounts[category.slug] ?? 0}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
