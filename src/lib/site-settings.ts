export const SITE_SETTING_KEYS = {
  SHOW_PRICE_TRACKER_BANNER: "show_price_tracker_banner",
  SHOW_COUNTDOWN_SALE_BANNER: "show_countdown_sale_banner",
  SHOW_TRENDING_CAROUSEL: "show_trending_carousel",
  MAINTENANCE_MODE: "maintenance_mode",
  ACTIVE_PROMO_BANNER: "active_promo_banner",
} as const;

export type SiteSettingKey =
  (typeof SITE_SETTING_KEYS)[keyof typeof SITE_SETTING_KEYS];

export const DEFAULT_SITE_SETTINGS: Record<SiteSettingKey, string> = {
  [SITE_SETTING_KEYS.SHOW_PRICE_TRACKER_BANNER]: "true",
  [SITE_SETTING_KEYS.SHOW_COUNTDOWN_SALE_BANNER]: "false",
  [SITE_SETTING_KEYS.SHOW_TRENDING_CAROUSEL]: "true",
  [SITE_SETTING_KEYS.MAINTENANCE_MODE]: "false",
  [SITE_SETTING_KEYS.ACTIVE_PROMO_BANNER]: "Summer edit — extra 15% off select styles",
};

export const FEATURE_TOGGLE_DEFINITIONS = [
  {
    key: SITE_SETTING_KEYS.SHOW_PRICE_TRACKER_BANNER,
    label: "Price tracker CTA",
    description: "Display the watchlist / price-drop banner site-wide.",
  },
  {
    key: SITE_SETTING_KEYS.SHOW_COUNTDOWN_SALE_BANNER,
    label: "Countdown sale banner",
    description: "Show the limited-time promo countdown strip.",
  },
  {
    key: SITE_SETTING_KEYS.SHOW_TRENDING_CAROUSEL,
    label: "Trending carousel",
    description: "Render the trending products carousel on the homepage.",
  },
  {
    key: SITE_SETTING_KEYS.MAINTENANCE_MODE,
    label: "Maintenance mode",
    description: "Hide the storefront from visitors (admins still have access).",
  },
] as const;

export function parseBooleanSetting(
  value: string | undefined | null,
  defaultValue = false
): boolean {
  if (value === undefined || value === null || value.trim() === "") {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

export function booleanToSettingValue(enabled: boolean): string {
  return enabled ? "true" : "false";
}
