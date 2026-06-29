import type { Metadata } from "next";
import { PAGE_CONTAINER } from "@/lib/layout-classes";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for Curated SHEIN.",
};

export default function TermsPage() {
  return (
    <div className={`${PAGE_CONTAINER} py-16 md:py-20`}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-light tracking-tight sm:text-3xl md:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          This placeholder terms page will be finalized before production launch.
          Curated SHEIN is an independent affiliate curation platform. Prices and
          availability are determined by SHEIN and may change without notice.
        </p>
      </div>
    </div>
  );
}
