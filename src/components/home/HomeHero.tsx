import Image from "next/image";
import { PAGE_CONTAINER } from "@/lib/layout-classes";
import { HomeHeroActions } from "./HomeHeroActions";

type HomeHeroProps = {
  heroImageUrl: string | null;
  primaryLookbookHref: string;
};

export function HomeHero({ heroImageUrl, primaryLookbookHref }: HomeHeroProps) {
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-neutral-950 text-white md:min-h-[78vh]">
      {heroImageUrl ? (
        <Image
          src={heroImageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-55"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div
        className={`${PAGE_CONTAINER} relative flex min-h-[70vh] flex-col justify-end pb-16 pt-28 md:min-h-[78vh] md:justify-center md:pb-24 md:pt-32`}
      >
        <div className="max-w-2xl">
          <p className="text-xs tracking-[0.3em] text-white/70 uppercase sm:text-sm">
            Curated SHEIN
          </p>
          <h1 className="mt-4 text-3xl font-light leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Look expensive.
            <span className="block text-white/90">Spend smart.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
            Curated outfits for every mood — without the scroll fatigue. Hand-picked
            trends, live pricing, and alerts when your saved looks drop.
          </p>
          <HomeHeroActions primaryHref={primaryLookbookHref} />
        </div>
      </div>
    </section>
  );
}
