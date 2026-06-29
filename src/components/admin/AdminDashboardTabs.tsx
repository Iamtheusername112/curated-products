"use client";

import { useSearchParams } from "next/navigation";
import { AdminNav } from "./AdminNav";

const TAB_IDS = ["toggles", "categories", "catalog"] as const;

type AdminDashboardTabsProps = {
  togglesPanel: React.ReactNode;
  categoriesPanel: React.ReactNode;
  catalogPanel: React.ReactNode;
};

export function AdminDashboardTabs({
  togglesPanel,
  categoriesPanel,
  catalogPanel,
}: AdminDashboardTabsProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "toggles";

  return (
    <div>
      <AdminNav />

      {activeTab === "categories" && categoriesPanel}
      {activeTab === "catalog" && catalogPanel}
      {(activeTab === "toggles" || !TAB_IDS.includes(activeTab as (typeof TAB_IDS)[number])) &&
        togglesPanel}
    </div>
  );
}
