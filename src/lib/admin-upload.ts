import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { MAX_PRODUCT_IMAGES } from "@/lib/product-images";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function saveProductImageUpload(file: File): Promise<string> {
  if (!file.size) {
    throw new Error("Image file is empty");
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Use a JPG, PNG, WebP, or GIF image");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5MB or smaller");
  }

  const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const filename = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/products/${filename}`;
}

export async function saveCategoryCoverUpload(file: File): Promise<string> {
  if (!file.size) {
    throw new Error("Cover image file is empty");
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Use a JPG, PNG, WebP, or GIF cover image");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Cover image must be 5MB or smaller");
  }

  const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const filename = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "categories");

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/categories/${filename}`;
}

export async function readCategoryCoverFromForm(
  formData: FormData,
  existingCoverUrl?: string | null
): Promise<string | null> {
  const coverFile = formData.get("coverImageFile");

  if (coverFile instanceof File && coverFile.size > 0) {
    return saveCategoryCoverUpload(coverFile);
  }

  const uploadedCover = String(formData.get("uploadedCoverUrl") ?? "").trim();
  if (uploadedCover.startsWith("/uploads/")) {
    return uploadedCover;
  }

  const removeCover = formData.get("removeCover") === "on";
  if (removeCover) {
    return null;
  }

  const kept = String(formData.get("coverImageUrl") ?? "").trim();
  if (kept.startsWith("/uploads/")) {
    return kept;
  }

  if (existingCoverUrl?.startsWith("/uploads/")) {
    return existingCoverUrl;
  }

  return null;
}

export async function saveProductImageUploads(files: File[]): Promise<string[]> {
  const uploads: string[] = [];

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    uploads.push(await saveProductImageUpload(file));
  }

  return uploads;
}

export function parseKeptImageUrls(formData: FormData): string[] {
  return formData
    .getAll("keptImages")
    .map((value) => String(value).trim())
    .filter((url) => url.startsWith("/uploads/"));
}

function parseUploadedImageUrls(formData: FormData): string[] {
  return formData
    .getAll("uploadedImageUrls")
    .map((value) => String(value).trim())
    .filter((url) => url.startsWith("/uploads/"));
}

function readNewImageFiles(formData: FormData): File[] {
  return formData
    .getAll("imageFiles")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

export async function resolveProductImagesFromForm(
  formData: FormData,
  options: {
    isCreate: boolean;
    existingImageUrls?: string[];
  }
): Promise<string[]> {
  const kept = parseKeptImageUrls(formData);
  const existing = (options.existingImageUrls ?? []).filter((url) =>
    url.startsWith("/uploads/")
  );
  const baseUrls = options.isCreate ? [] : kept.length > 0 ? kept : existing;
  const preUploaded = parseUploadedImageUrls(formData);
  const newPaths =
    preUploaded.length > 0
      ? preUploaded
      : await saveProductImageUploads(readNewImageFiles(formData));
  const merged = [...baseUrls, ...newPaths];

  if (merged.length === 0) {
    throw new Error("Upload at least one product image.");
  }

  if (merged.length > MAX_PRODUCT_IMAGES) {
    throw new Error(`Maximum ${MAX_PRODUCT_IMAGES} images per product.`);
  }

  return merged;
}
