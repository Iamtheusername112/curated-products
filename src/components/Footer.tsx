import Link from "next/link";
import { getActiveFrontendCategories } from "@/lib/cms-queries";
import { PAGE_CONTAINER } from "@/lib/layout-classes";
import { getSheinSearchReferralCode } from "@/lib/shein-config";
import { CopySearchCodeButton } from "./CopySearchCodeButton";

export async function Footer() {
  const categories = await getActiveFrontendCategories();
  const searchCode = getSheinSearchReferralCode();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50 text-neutral-600">
      <div className={`${PAGE_CONTAINER} py-12 md:py-16`}>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="text-sm font-bold tracking-wider text-black uppercase"
            >
              Curated SHEIN
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-500">
              A programmatic style engine curating the internet&apos;s best fashion
              trends for less.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-neutral-400 uppercase">
              Lookbooks
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/lookbook"
                  className="text-sm transition-colors hover:text-black"
                >
                  All lookbooks
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/lookbook/${category.slug}`}
                    className="text-sm transition-colors hover:text-black"
                  >
                    {category.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-neutral-400 uppercase">
              Disclosure
            </p>
            <p className="mt-4 text-xs leading-relaxed text-neutral-500">
              We are an independent curation platform. Clicking our curated styling
              looks connects you via tracked affiliate parameters to official merchant
              platforms.
            </p>
          </div>

          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <p className="text-xs font-medium tracking-[0.2em] text-neutral-400 uppercase">
                SHEIN search code
              </p>
              <p className="mt-3 font-mono text-lg font-medium tracking-widest text-black">
                {searchCode}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                Paste this in SHEIN search to support curated picks.
              </p>
              <CopySearchCodeButton code={searchCode} />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-8 text-xs text-neutral-400 md:flex-row">
          <p>© {year} Curated SHEIN. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="transition-colors hover:text-neutral-600">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-neutral-600">
              Terms of Service
            </Link>
          </div>
          <p className="text-center md:text-right">
            Next.js · Neon Postgres · Clerk Auth
          </p>
        </div>
      </div>
    </footer>
  );
}
