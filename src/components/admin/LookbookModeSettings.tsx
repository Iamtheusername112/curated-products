"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, startTransition } from "react";
import {
  deleteFrontendCategoryAction,
  toggleCategoryActiveAction,
  updateFrontendCategory,
} from "@/app/actions/categories";
import type { FrontendCategory } from "@/db/schema";
import type { CategoryActionResult } from "@/types/actions";
import {
  buildFormDataWithoutFiles,
  uploadCategoryCoverViaApi,
} from "@/lib/admin-upload-client";
import { resolveCategoryCoverUrl } from "@/lib/images";

const initialState: CategoryActionResult = { success: false };

type LookbookModeSettingsProps = {
  category: FrontendCategory;
};

export function LookbookModeSettings({ category }: LookbookModeSettingsProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateFrontendCategory,
    initialState
  );
  const [toggleState, toggleAction, isToggling] = useActionState(
    toggleCategoryActiveAction,
    initialState
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteFrontendCategoryAction,
    initialState
  );
  const [uploading, setUploading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending) {
      setUploading(false);
    }
  }, [isPending]);

  useEffect(() => {
    if (state.success || toggleState.success) {
      router.refresh();
    }
  }, [state.success, toggleState.success, router]);

  useEffect(() => {
    if (deleteState.success) {
      router.push("/admin");
    }
  }, [deleteState.success, router]);

  const coverPreview = resolveCategoryCoverUrl(category.coverImageUrl);
  const isSaving = isPending || uploading;

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);
    setUploading(true);

    try {
      const form = event.currentTarget;
      const raw = new FormData(form);
      const coverFile = raw.get("coverImageFile");
      const submission = buildFormDataWithoutFiles(form);

      if (coverFile instanceof File && coverFile.size > 0) {
        const url = await uploadCategoryCoverViaApi(coverFile);
        submission.set("uploadedCoverUrl", url);
      }

      startTransition(() => {
        formAction(submission);
      });
    } catch (error) {
      setClientError(error instanceof Error ? error.message : "Cover upload failed");
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-neutral-50 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">Shopping mood details</h2>
          <p className="mt-1 text-sm text-muted">
            Public URL:{" "}
            <Link
              href={`/lookbook/${category.slug}`}
              className="underline underline-offset-2"
            >
              /lookbook/{category.slug}
            </Link>
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            category.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-neutral-200 text-muted"
          }`}
        >
          {category.isActive ? "Visible on storefront" : "Hidden from storefront"}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <input type="hidden" name="id" value={category.id} />
        <input type="hidden" name="isActive" value={category.isActive ? "true" : "false"} />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="displayName" className="mb-2 block text-sm font-medium">
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              required
              defaultValue={category.displayName}
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
            />
          </div>
          <div>
            <label htmlFor="displayOrder" className="mb-2 block text-sm font-medium">
              Homepage sort order
            </label>
            <input
              id="displayOrder"
              name="displayOrder"
              type="number"
              defaultValue={category.displayOrder}
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
            />
            <p className="mt-1 text-xs text-muted">Lower numbers appear first</p>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium">
            Mood description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={category.description ?? ""}
            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm leading-relaxed"
            placeholder="Describe the vibe shoppers should expect from this edit..."
          />
        </div>

        <div>
          <label htmlFor="coverImageFile" className="mb-2 block text-sm font-medium">
            Cover photo
          </label>
          {coverPreview ? (
            <div className="mb-3 relative h-40 w-full max-w-xs overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src={coverPreview}
                alt={`${category.displayName} cover`}
                fill
                className="object-cover"
              />
            </div>
          ) : null}
          {coverPreview ? (
            <input type="hidden" name="coverImageUrl" value={coverPreview} />
          ) : null}
          <input
            id="coverImageFile"
            name="coverImageFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-sm file:font-medium"
          />
          <p className="mt-1 text-xs text-muted">
            Upload a JPG, PNG, WebP, or GIF. External links (Google, Pinterest, etc.)
            are not supported — leave blank to use your latest product photo instead.
          </p>
          {coverPreview ? (
            <label className="mt-3 flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" name="removeCover" className="h-4 w-4 rounded border-border" />
              Remove current cover (use product photo fallback)
            </label>
          ) : null}
        </div>

        {clientError ? <p className="text-sm text-red-600">{clientError}</p> : null}
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state.success ? (
          <p className="text-sm text-emerald-700">Shopping mood updated.</p>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm text-background disabled:opacity-50"
        >
          {uploading ? "Uploading cover..." : isPending ? "Saving..." : "Save mood details"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <form action={toggleAction}>
          <input type="hidden" name="id" value={category.id} />
          <input type="hidden" name="isActive" value={String(!category.isActive)} />
          <button
            type="submit"
            disabled={isToggling}
            className="inline-flex h-10 items-center rounded-full border border-border bg-white px-5 text-sm disabled:opacity-50"
          >
            {category.isActive ? "Hide from storefront" : "Show on storefront"}
          </button>
        </form>
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (
              !window.confirm(
                `Delete "${category.displayName}" permanently?\n\nProducts assigned to this mood will remain in the database.`
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
            className="inline-flex h-10 items-center rounded-full border border-red-200 bg-white px-5 text-sm text-red-600 disabled:opacity-50"
          >
            Delete mood
          </button>
        </form>
      </div>

      {(toggleState.error || deleteState.error) && (
        <p className="text-sm text-red-600">{toggleState.error ?? deleteState.error}</p>
      )}
    </div>
  );
}
