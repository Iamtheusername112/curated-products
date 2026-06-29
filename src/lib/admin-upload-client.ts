import { MAX_PRODUCT_IMAGES } from "@/lib/product-images";

export async function uploadProductImagesViaApi(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  if (files.length > MAX_PRODUCT_IMAGES) {
    throw new Error(`Maximum ${MAX_PRODUCT_IMAGES} images per product.`);
  }

  const body = new FormData();
  for (const file of files) {
    body.append("files", file);
  }

  const response = await fetch("/api/admin/upload?type=products", {
    method: "POST",
    body,
  });

  const payload = (await response.json()) as { urls?: string[]; error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Image upload failed");
  }

  return payload.urls ?? [];
}

export async function uploadCategoryCoverViaApi(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/admin/upload?type=categories", {
    method: "POST",
    body,
  });

  const payload = (await response.json()) as { url?: string; error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Cover upload failed");
  }

  if (!payload.url) {
    throw new Error("Cover upload failed");
  }

  return payload.url;
}

export function buildFormDataWithoutFiles(form: HTMLFormElement): FormData {
  const raw = new FormData(form);
  const submission = new FormData();

  for (const [key, value] of raw.entries()) {
    if (key === "imageFiles" || key === "coverImageFile") continue;
    if (value instanceof File) continue;
    submission.append(key, value);
  }

  return submission;
}
