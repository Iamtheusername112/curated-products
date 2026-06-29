import { NextRequest, NextResponse } from "next/server";
import {
  saveCategoryCoverUpload,
  saveProductImageUpload,
} from "@/lib/admin-upload";
import { requireAdmin } from "@/lib/auth";
import { MAX_PRODUCT_IMAGES } from "@/lib/product-images";

export const runtime = "nodejs";

function readFiles(formData: FormData, fieldName: string): File[] {
  return formData
    .getAll(fieldName)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type") ?? "products";

  try {
    const formData = await request.formData();

    if (type === "categories") {
      const [file] = readFiles(formData, "file");
      if (!file) {
        return NextResponse.json({ error: "No cover image provided" }, { status: 400 });
      }

      const url = await saveCategoryCoverUpload(file);
      return NextResponse.json({ url });
    }

    const files = readFiles(formData, "files");
    if (files.length === 0) {
      return NextResponse.json({ error: "No image files provided" }, { status: 400 });
    }

    if (files.length > MAX_PRODUCT_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PRODUCT_IMAGES} images per upload` },
        { status: 400 }
      );
    }

    const urls: string[] = [];
    for (const file of files) {
      urls.push(await saveProductImageUpload(file));
    }

    return NextResponse.json({ urls });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    );
  }
}
