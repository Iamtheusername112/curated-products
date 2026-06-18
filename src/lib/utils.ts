export function slugifyCategory(category: string): string {
  return category
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatCategoryLabel(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const CURATED_CATEGORIES = [
  { slug: "y2k-aesthetic", label: "Y2K Aesthetic" },
  { slug: "minimalist-office", label: "Minimalist Office" },
  { slug: "streetwear", label: "Streetwear" },
  { slug: "date-night", label: "Date Night" },
  { slug: "vacation-resort", label: "Vacation & Resort" },
] as const;

export type CategorySlug = (typeof CURATED_CATEGORIES)[number]["slug"];
