import {
  FEATURE_TOGGLE_DEFINITIONS,
  SITE_SETTING_KEYS,
  parseBooleanSetting,
} from "@/lib/site-settings";
import { FeatureToggleSwitch } from "./FeatureToggleSwitch";
import { PromoBannerEditor } from "./PromoBannerEditor";

type FeatureTogglesPanelProps = {
  settings: Map<string, string>;
};

export function FeatureTogglesPanel({ settings }: FeatureTogglesPanelProps) {
  const promoText =
    settings.get(SITE_SETTING_KEYS.ACTIVE_PROMO_BANNER) ??
    "Summer edit — extra 15% off select styles";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-light tracking-tight">Feature toggles</h2>
        <p className="mt-2 text-sm text-muted">
          Flip switches to show or hide storefront modules instantly.
        </p>
      </div>

      <div className="space-y-3">
        {FEATURE_TOGGLE_DEFINITIONS.map((toggle) => (
          <FeatureToggleSwitch
            key={toggle.key}
            settingKey={toggle.key}
            label={toggle.label}
            description={toggle.description}
            enabled={parseBooleanSetting(settings.get(toggle.key), false)}
          />
        ))}
      </div>

      <PromoBannerEditor initialText={promoText} />
    </div>
  );
}
