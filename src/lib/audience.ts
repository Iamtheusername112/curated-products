import type { Product } from "@/db/schema";

export const PRODUCT_AUDIENCE_VALUES = [
  "women",
  "men",
  "kids-boys",
  "kids-girls",
] as const;

export type ProductAudience = (typeof PRODUCT_AUDIENCE_VALUES)[number];

export type AudienceSectionId = "women" | "men" | "kids";

export type LookbookSubsection = {
  id: ProductAudience;
  title: string;
};

export type LookbookSection = {
  id: AudienceSectionId;
  title: string;
  audiences: ProductAudience[];
  subsections?: LookbookSubsection[];
};

export const LOOKBOOK_AUDIENCE_SECTIONS: LookbookSection[] = [
  { id: "women", title: "Women", audiences: ["women"] },
  { id: "men", title: "Men", audiences: ["men"] },
  {
    id: "kids",
    title: "Kids",
    audiences: ["kids-boys", "kids-girls"],
    subsections: [
      { id: "kids-boys", title: "Boys" },
      { id: "kids-girls", title: "Girls" },
    ],
  },
];

export const PRODUCT_AUDIENCE_OPTIONS: Array<{
  value: ProductAudience;
  label: string;
  hint: string;
}> = [
  { value: "women", label: "Women", hint: "Adult women's styles" },
  { value: "men", label: "Men", hint: "Adult men's styles" },
  { value: "kids-boys", label: "Kids · Boys", hint: "Children's boys section" },
  { value: "kids-girls", label: "Kids · Girls", hint: "Children's girls section" },
];

export const DEFAULT_PRODUCT_AUDIENCE: ProductAudience = "women";

export function isProductAudience(value: string): value is ProductAudience {
  return PRODUCT_AUDIENCE_VALUES.includes(value as ProductAudience);
}

export function parseProductAudience(
  value: string | null | undefined
): ProductAudience {
  const normalized = value?.trim().toLowerCase();
  if (normalized && isProductAudience(normalized)) {
    return normalized;
  }
  return DEFAULT_PRODUCT_AUDIENCE;
}

export function getAudienceLabel(audience: string | null | undefined): string {
  return (
    PRODUCT_AUDIENCE_OPTIONS.find((option) => option.value === audience)?.label ??
    "Women"
  );
}

export function groupProductsByAudience(
  products: Product[]
): Map<ProductAudience, Product[]> {
  const grouped = new Map<ProductAudience, Product[]>();

  for (const audience of PRODUCT_AUDIENCE_VALUES) {
    grouped.set(audience, []);
  }

  for (const product of products) {
    const audience = parseProductAudience(product.audience);
    grouped.get(audience)!.push(product);
  }

  return grouped;
}

export function getVisibleLookbookSections(products: Product[]): LookbookSection[] {
  const grouped = groupProductsByAudience(products);

  return LOOKBOOK_AUDIENCE_SECTIONS.filter((section) => {
    if (section.subsections) {
      return section.subsections.some(
        (subsection) => (grouped.get(subsection.id)?.length ?? 0) > 0
      );
    }

    return (grouped.get(section.audiences[0])?.length ?? 0) > 0;
  });
}
