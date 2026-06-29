"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  createFrontendCategory,
  deleteFrontendCategoryAction,
  toggleCategoryActiveAction,
  updateFrontendCategory,
} from "@/app/actions/categories";
import type { FrontendCategory } from "@/db/schema";
import type { CategoryActionResult, CategoryFormState } from "@/types/actions";

const createInitial: CategoryFormState = { success: false };
const actionInitial: CategoryActionResult = { success: false };

type CategoryManagerProps = {
  categories: FrontendCategory[];
};

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [createState, createAction, isCreating] = useActionState(
    createFrontendCategory,
    createInitial
  );

  useEffect(() => {
    if (createState.success) {
      router.refresh();
    }
  }, [createState.success, router]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-light tracking-tight">Category manager</h2>
        <p className="mt-2 text-sm text-muted">
          Control lookbook navigation and homepage category cards. Inactive categories
          are hidden from the public site.
        </p>
      </div>

      <form action={createAction} className="rounded-2xl border border-border p-5 space-y-4">
        <p className="font-medium">Add category</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="displayName" className="mb-2 block text-sm">
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              required
              className="h-11 w-full rounded-xl border border-border px-3 text-sm"
              placeholder="Y2K Summer Vibe"
            />
          </div>
          <div>
            <label htmlFor="slug" className="mb-2 block text-sm">
              Slug (optional)
            </label>
            <input
              id="slug"
              name="slug"
              className="h-11 w-full rounded-xl border border-border px-3 text-sm"
              placeholder="y2k-summer"
            />
          </div>
          <div>
            <label htmlFor="coverImageUrl" className="mb-2 block text-sm">
              Cover image URL
            </label>
            <input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              className="h-11 w-full rounded-xl border border-border px-3 text-sm"
              placeholder="https://..."
            />
          </div>
          <div>
            <label htmlFor="displayOrder" className="mb-2 block text-sm">
              Display order
            </label>
            <input
              id="displayOrder"
              name="displayOrder"
              type="number"
              defaultValue={categories.length}
              className="h-11 w-full rounded-xl border border-border px-3 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm text-background disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Create category"}
        </button>
        {createState.error && (
          <p className="text-sm text-red-600">{createState.error}</p>
        )}
      </form>

      <div className="space-y-4">
        {categories.length === 0 ? (
          <p className="text-sm text-muted">No categories yet.</p>
        ) : (
          categories.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))
        )}
      </div>
    </div>
  );
}

function CategoryRow({ category }: { category: FrontendCategory }) {
  const router = useRouter();
  const [updateState, updateAction, isUpdating] = useActionState(
    updateFrontendCategory,
    actionInitial
  );
  const [toggleState, toggleAction, isToggling] = useActionState(
    toggleCategoryActiveAction,
    actionInitial
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteFrontendCategoryAction,
    actionInitial
  );

  useEffect(() => {
    if (updateState.success || toggleState.success || deleteState.success) {
      router.refresh();
    }
  }, [updateState.success, toggleState.success, deleteState.success, router]);

  return (
    <div className="rounded-2xl border border-border p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">/{category.slug}</p>
          <p className="mt-1 text-sm text-muted">
            {category.isActive ? "Active" : "Hidden"} · order {category.displayOrder}
          </p>
        </div>
        <div className="flex gap-2">
          <form action={toggleAction}>
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="isActive" value={String(!category.isActive)} />
            <button
              type="submit"
              disabled={isToggling}
              className="h-9 rounded-full border border-border px-4 text-sm disabled:opacity-50"
            >
              {category.isActive ? "Deactivate" : "Activate"}
            </button>
          </form>
          <form
            action={deleteAction}
            onSubmit={(event) => {
              if (
                !window.confirm(
                  `Delete "${category.displayName}"? Products keep their category slug but the lookbook route will 404 unless recreated.`
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
              className="h-9 rounded-full border border-red-200 px-4 text-sm text-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="id" value={category.id} />
        <input type="hidden" name="isActive" value={String(category.isActive)} />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm">Display name</label>
            <input
              name="displayName"
              defaultValue={category.displayName}
              className="h-10 w-full rounded-xl border border-border px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">Cover image URL</label>
            <input
              name="coverImageUrl"
              defaultValue={category.coverImageUrl ?? ""}
              className="h-10 w-full rounded-xl border border-border px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm">Display order</label>
            <input
              name="displayOrder"
              type="number"
              defaultValue={category.displayOrder}
              className="h-10 w-full rounded-xl border border-border px-3 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm text-background disabled:opacity-50"
        >
          {isUpdating ? "Saving..." : "Save changes"}
        </button>
      </form>

      {(updateState.error || toggleState.error || deleteState.error) && (
        <p className="mt-3 text-sm text-red-600">
          {updateState.error ?? toggleState.error ?? deleteState.error}
        </p>
      )}
    </div>
  );
}
