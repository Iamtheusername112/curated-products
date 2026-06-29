import type { Metadata } from "next";
import { PAGE_CONTAINER } from "@/lib/layout-classes";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Curated SHEIN.",
};

export default function PrivacyPage() {
  return (
    <div className={`${PAGE_CONTAINER} py-16 md:py-20`}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-light tracking-tight sm:text-3xl md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          This placeholder policy will be expanded before production launch. We use
          Clerk for authentication and Neon Postgres for stored watchlist data. Affiliate
          outbound links may set third-party cookies on merchant sites.
        </p>
      </div>
    </div>
  );
}
