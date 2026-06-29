import { isAdmin } from "@/lib/admin";
import { isSiteSettingEnabled } from "@/lib/cms-queries";
import { SITE_SETTING_KEYS } from "@/lib/site-settings";
import { MaintenanceScreen } from "./MaintenanceScreen";

export async function StorefrontGate({ children }: { children: React.ReactNode }) {
  const maintenanceEnabled = await isSiteSettingEnabled(
    SITE_SETTING_KEYS.MAINTENANCE_MODE,
    false
  );

  if (!maintenanceEnabled) {
    return children;
  }

  const admin = await isAdmin();
  if (admin) {
    return children;
  }

  return <MaintenanceScreen />;
}
