"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, startTransition } from "react";
import {
  createCatalogProduct,
  deleteCatalogProduct,
  updateCatalogProduct,
} from "@/app/actions/products-admin";
import type { Product } from "@/db/schema";
import type { ProductAdminFormState } from "@/types/actions";
import { formatPrice } from "@/lib/affiliate";
import { PRODUCT_AUDIENCE_OPTIONS, getAudienceLabel, parseProductAudience } from "@/lib/audience";
import { ProductImage } from "@/components/ProductImage";
import { MAX_PRODUCT_IMAGES } from "@/lib/product-images";
import {
  buildFormDataWithoutFiles,
  uploadProductImagesViaApi,
} from "@/lib/admin-upload-client";

const initialState: ProductAdminFormState = { success: false };

export type AdminProduct = Product & {
  imageUrls: string[];
};

type ProductEditorFormProps = {
  categorySlug: string;
  categoryLabel: string;
  product?: AdminProduct;
  onCancelEdit?: () => void;
};

function getInitialImageUrls(product?: AdminProduct): string[] {
  if (!product) return [];
  if (product.imageUrls.length > 0) {
    return product.imageUrls.filter((url) => url.startsWith("/uploads/"));
  }
  return product.imageUrl.startsWith("/uploads/") ? [product.imageUrl] : [];
}

export function ProductEditorForm({
  categorySlug,
  categoryLabel,
  product,
  onCancelEdit,
}: ProductEditorFormProps) {
  const router = useRouter();
  const isEditing = Boolean(product);
  const action = isEditing ? updateCatalogProduct : createCatalogProduct;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [keptImages, setKeptImages] = useState<string[]>(() =>
    getInitialImageUrls(product)
  );
  const [pendingUploadCount, setPendingUploadCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending) {
      setUploading(false);
    }
  }, [isPending]);

  useEffect(() => {
    setKeptImages(getInitialImageUrls(product));
    setPendingUploadCount(0);
  }, [product]);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      if (!isEditing) {
        const form = document.getElementById("product-admin-form") as HTMLFormElement | null;
        form?.reset();
        setKeptImages([]);
        setPendingUploadCount(0);
      }
    }
  }, [state.success, isEditing, router]);

  const totalImages = keptImages.length + pendingUploadCount;
  const atImageLimit = totalImages >= MAX_PRODUCT_IMAGES;
  const isSaving = isPending || uploading;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);
    setUploading(true);

    try {
      const form = event.currentTarget;
      const raw = new FormData(form);
      const imageFiles = raw
        .getAll("imageFiles")
        .filter((entry): entry is File => entry instanceof File && entry.size > 0);

      const submission = buildFormDataWithoutFiles(form);

      if (imageFiles.length > 0) {
        const urls = await uploadProductImagesViaApi(imageFiles);
        for (const url of urls) {
          submission.append("uploadedImageUrls", url);
        }
      }

      startTransition(() => {
        formAction(submission);
      });
    } catch (error) {
      setClientError(error instanceof Error ? error.message : "Image upload failed");
      setUploading(false);
    }
  }

  return (
    <form
      id="product-admin-form"
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-border bg-white p-6"
    >
      <div>
        <h3 className="text-lg font-medium">
          {isEditing ? "Edit product" : "Add product"}
        </h3>
        <p className="mt-1 text-sm text-muted">
          Listing in <span className="font-medium text-foreground">{categoryLabel}</span>.
          Upload up to {MAX_PRODUCT_IMAGES} photos per product — shoppers can browse them all.
        </p>
      </div>

      {isEditing && product ? (
        <input type="hidden" name="productId" value={product.id} />
      ) : null}
      <input type="hidden" name="categorySlug" value={categorySlug} />
      {keptImages.map((url) => (
        <input key={url} type="hidden" name="keptImages" value={url} />
      ))}

      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium">
          Product title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={product?.title ?? ""}
          className="h-11 w-full rounded-xl border border-border px-3 text-sm"
          placeholder="Platform Chunky Sneakers"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className="w-full rounded-xl border border-border px-3 py-2 text-sm leading-relaxed"
          placeholder="Why this piece belongs in the lookbook — fit, styling notes, occasion..."
        />
      </div>

      <div>
        <p className="mb-3 block text-sm font-medium">Shop section</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {PRODUCT_AUDIENCE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-border px-4 py-3 has-[:checked]:border-foreground has-[:checked]:bg-neutral-50"
            >
              <input
                type="radio"
                name="audience"
                value={option.value}
                defaultChecked={
                  parseProductAudience(product?.audience) === option.value
                }
                className="mt-1 h-4 w-4 border-border"
              />
              <span>
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="mt-0.5 block text-xs text-muted">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="currentPrice" className="mb-2 block text-sm font-medium">
            Sale price
          </label>
          <input
            id="currentPrice"
            name="currentPrice"
            defaultValue={product?.currentPrice ?? ""}
            className="h-11 w-full rounded-xl border border-border px-3 text-sm"
            placeholder="4,86"
          />
          <p className="mt-1 text-xs text-muted">Use comma or dot decimals (e.g. 4,86 or 4.86)</p>
        </div>
        <div>
          <label htmlFor="originalPrice" className="mb-2 block text-sm font-medium">
            Compare-at price
          </label>
          <input
            id="originalPrice"
            name="originalPrice"
            defaultValue={product?.originalPrice ?? ""}
            className="h-11 w-full rounded-xl border border-border px-3 text-sm"
            placeholder="9,99"
          />
        </div>
      </div>

      <div>
        <label htmlFor="affiliateUrl" className="mb-2 block text-sm font-medium">
          Your affiliate link
        </label>
        <input
          id="affiliateUrl"
          name="affiliateUrl"
          type="url"
          required
          defaultValue={product?.affiliateUrl ?? product?.rawProductUrl ?? ""}
          className="h-11 w-full rounded-xl border border-border px-3 text-sm"
          placeholder="https://www.shein.com/..."
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor="imageFiles" className="block text-sm font-medium">
            Product photos {isEditing ? "" : "(required)"}
          </label>
          <span className="text-xs text-muted">
            {totalImages} / {MAX_PRODUCT_IMAGES}
          </span>
        </div>

        {keptImages.length > 0 ? (
          <div className="mb-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
            {keptImages.map((url, index) => (
              <div key={url} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100">
                <Image
                  src={url}
                  alt={`Existing photo ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() =>
                    setKeptImages((current) => current.filter((item) => item !== url))
                  }
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <input
          id="imageFiles"
          name="imageFiles"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          required={!isEditing && keptImages.length === 0}
          disabled={atImageLimit}
          onChange={(event) => {
            setPendingUploadCount(event.target.files?.length ?? 0);
          }}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-sm file:font-medium disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-muted">
          JPG, PNG, WebP, or GIF — max 5MB each. Select multiple files at once.
        </p>
        {atImageLimit ? (
          <p className="mt-1 text-xs text-amber-700">
            Image limit reached. Remove a photo before adding more.
          </p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isTrending"
          defaultChecked={product?.isTrending ?? false}
          className="h-4 w-4 rounded border-border"
        />
        Feature on homepage trending section
      </label>

      {clientError ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{clientError}</p>
      ) : null}
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {isEditing ? "Product updated on the storefront." : "Product published to the storefront."}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background disabled:opacity-50"
        >
          {uploading
            ? "Uploading photos..."
            : isPending
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Publish product"}
        </button>
        {isEditing && onCancelEdit ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm"
          >
            Cancel edit
          </button>
        ) : null}
      </div>
    </form>
  );
}

type ProductAdminListProps = {
  products: AdminProduct[];
  onEdit: (product: AdminProduct) => void;
};

export function ProductAdminList({
  products,
  onEdit,
}: ProductAdminListProps) {
  const router = useRouter();
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteCatalogProduct,
    initialState
  );

  useEffect(() => {
    if (deleteState.success) router.refresh();
  }, [deleteState.success, router]);

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted">
        No products in this shopping mode yet. Add your first piece below.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => {
        const coverUrl =
          product.imageUrls[0] ??
          (product.imageUrl.startsWith("/uploads/") ? product.imageUrl : null);

        return (
          <div
            key={product.id}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 sm:flex-row sm:items-center"
          >
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
              <ProductImage
                sheinProductId={product.sheinProductId}
                imageUrl={coverUrl ?? product.imageUrl}
                alt={product.title}
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{product.title}</p>
              {product.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted">{product.description}</p>
              ) : null}
            <p className="mt-2 text-xs text-muted">
              {getAudienceLabel(product.audience)}
              {" · "}
              {product.currentPrice ? formatPrice(product.currentPrice) : "No price"}
                {product.imageUrls.length > 0
                  ? ` · ${product.imageUrls.length} photo${product.imageUrls.length === 1 ? "" : "s"}`
                  : ""}
                {product.isTrending ? " · Trending" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/product/${product.id}`}
                className="inline-flex h-9 items-center rounded-full border border-border px-4 text-xs"
              >
                View live
              </Link>
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="inline-flex h-9 items-center rounded-full border border-border px-4 text-xs"
              >
                Edit
              </button>
              <form action={deleteAction}>
                <input type="hidden" name="productId" value={product.id} />
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="inline-flex h-9 items-center rounded-full border border-red-200 px-4 text-xs text-red-600"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LookbookModeWorkspace({
  categorySlug,
  categoryLabel,
  products,
}: {
  categorySlug: string;
  categoryLabel: string;
  products: AdminProduct[];
}) {
  const [editingProduct, setEditingProduct] = useState<AdminProduct | undefined>();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-light tracking-tight">Products in this mode</h2>
          <p className="mt-2 text-sm text-muted">
            Everything here appears on the public lookbook for shoppers.
          </p>
        </div>
        <ProductAdminList
          products={products}
          onEdit={(product) => setEditingProduct(product)}
        />
      </div>
      <ProductEditorForm
        key={editingProduct?.id ?? "new"}
        categorySlug={categorySlug}
        categoryLabel={categoryLabel}
        product={editingProduct}
        onCancelEdit={() => setEditingProduct(undefined)}
      />
    </div>
  );
}
