import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/db/schema";
import {
  type LookbookSection,
  type ProductAudience,
} from "@/lib/audience";
import { PRODUCT_GRID } from "@/lib/layout-classes";

type LookbookAudienceNavProps = {
  visibleSections: LookbookSection[];
};

export function LookbookAudienceNav({ visibleSections }: LookbookAudienceNavProps) {
  if (visibleSections.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Shop by audience"
      className="sticky top-16 z-20 -mx-1 mb-10 overflow-x-auto border-b border-border bg-background/95 py-3 backdrop-blur-sm"
    >
      <div className="flex min-w-max gap-2 px-1">
        {visibleSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm transition-colors hover:border-foreground hover:bg-neutral-50"
          >
            {section.title}
          </a>
        ))}
      </div>
    </nav>
  );
}

type LookbookAudienceSectionsProps = {
  watchlistedIds: Set<number>;
  grouped: Map<ProductAudience, Product[]>;
  visibleSections: LookbookSection[];
};

export function LookbookAudienceSections({
  watchlistedIds,
  grouped,
  visibleSections,
}: LookbookAudienceSectionsProps) {
  if (visibleSections.length === 0) {
    return null;
  }

  if (visibleSections.length === 1 && !visibleSections[0].subsections) {
    const section = visibleSections[0];
    const sectionProducts = grouped.get(section.audiences[0]) ?? [];

    return (
      <div className={PRODUCT_GRID}>
        {sectionProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isWatchlisted={watchlistedIds.has(product.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-14 md:space-y-20">
      {visibleSections.map((section) => {
        if (section.subsections) {
          const subsectionsWithProducts = section.subsections.filter(
            (subsection) => (grouped.get(subsection.id)?.length ?? 0) > 0
          );

          if (subsectionsWithProducts.length === 0) return null;

          return (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <div className="mb-8 border-b border-border pb-4">
                <h2 className="text-2xl font-light tracking-tight md:text-3xl">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-12">
                {subsectionsWithProducts.map((subsection) => {
                  const subsectionProducts = grouped.get(subsection.id) ?? [];

                  return (
                    <div key={subsection.id} id={subsection.id} className="scroll-mt-28">
                      <h3 className="mb-6 text-sm font-medium tracking-[0.2em] text-muted uppercase">
                        {subsection.title}
                      </h3>
                      <div className={PRODUCT_GRID}>
                        {subsectionProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            isWatchlisted={watchlistedIds.has(product.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        }

        const sectionProducts = grouped.get(section.audiences[0]) ?? [];
        if (sectionProducts.length === 0) return null;

        return (
          <section key={section.id} id={section.id} className="scroll-mt-28">
            <div className="mb-8 border-b border-border pb-4">
              <h2 className="text-2xl font-light tracking-tight md:text-3xl">
                {section.title}
              </h2>
            </div>
            <div className={PRODUCT_GRID}>
              {sectionProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWatchlisted={watchlistedIds.has(product.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
