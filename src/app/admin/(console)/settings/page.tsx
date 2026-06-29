import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { FeatureTogglesPanel } from "@/components/admin/FeatureTogglesPanel";
import {
  ensureDefaultSiteSettings,
  getSiteSettingsMap,
} from "@/lib/cms-queries";
import { PAGE_CONTAINER, PAGE_EYEBROW, PAGE_HEADING } from "@/lib/layout-classes";

export const metadata = {
  title: "Admin · Site settings",
};

export default async function AdminSettingsPage() {
  await ensureDefaultSiteSettings();
  const settings = await getSiteSettingsMap();

  return (
    <div className={`${PAGE_CONTAINER} max-w-3xl py-12 md:py-16`}>
      <div className="mb-8 md:mb-10">
        <p className={PAGE_EYEBROW}>Storefront admin</p>
        <h1 className={`mt-3 ${PAGE_HEADING}`}>Site settings</h1>
        <p className="mt-4 text-muted">
          Toggle banners and maintenance mode. Product content is managed under Shopping modes.
        </p>
      </div>

      <Suspense fallback={null}>
        <AdminNav />
      </Suspense>

      <FeatureTogglesPanel settings={settings} />
    </div>
  );
}
