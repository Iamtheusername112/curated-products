import { PAGE_CONTAINER } from "@/lib/layout-classes";

const TRUST_ITEMS = [
  {
    title: "Editorial curation",
    description: "Every lookbook is styled by mood — not random catalog noise.",
  },
  {
    title: "Prices checked daily",
    description: "See real sale prices before you commit to the cart.",
  },
  {
    title: "Drop alerts",
    description: "Save a piece once. We watch the price so you don't have to.",
  },
] as const;

export function TrustStrip() {
  return (
    <section className="border-b border-border bg-white">
      <div className={`${PAGE_CONTAINER} grid gap-8 py-10 md:grid-cols-3 md:gap-12 md:py-12`}>
        {TRUST_ITEMS.map((item) => (
          <div key={item.title}>
            <p className="text-sm font-medium tracking-wide text-foreground">
              {item.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
