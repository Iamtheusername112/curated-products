"use client";

import { useActionState } from "react";
import { toggleSiteSettingAction } from "@/app/actions/site-settings";
import { parseBooleanSetting } from "@/lib/site-settings";
import type { SiteSettingActionResult } from "@/types/actions";

const initialState: SiteSettingActionResult = { success: false };

type FeatureToggleSwitchProps = {
  settingKey: string;
  label: string;
  description: string;
  enabled: boolean;
};

export function FeatureToggleSwitch({
  settingKey,
  label,
  description,
  enabled,
}: FeatureToggleSwitchProps) {
  const [state, formAction, isPending] = useActionState(
    toggleSiteSettingAction,
    initialState
  );

  const isOn =
    state.key === settingKey && state.value !== undefined
      ? parseBooleanSetting(state.value)
      : enabled;

  return (
    <form
      action={formAction}
      className="flex items-start justify-between gap-6 rounded-2xl border border-border p-5"
    >
      <div>
        <p className="font-medium">{label}</p>
        <p className="mt-1 text-sm text-muted">{description}</p>
        {state.key === settingKey && state.error && (
          <p className="mt-2 text-sm text-red-600">{state.error}</p>
        )}
      </div>

      <input type="hidden" name="key" value={settingKey} />
      <input type="hidden" name="enabled" value={isOn ? "false" : "true"} />

      <button
        type="submit"
        disabled={isPending}
        role="switch"
        aria-checked={isOn}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
          isOn ? "bg-foreground" : "bg-neutral-200"
        }`}
      >
        <span
          className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
            isOn ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
        <span className="sr-only">{isOn ? "Disable" : "Enable"} {label}</span>
      </button>
    </form>
  );
}
