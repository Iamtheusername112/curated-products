"use client";

import { useActionState } from "react";
import { updatePromoBannerText } from "@/app/actions/site-settings";
import type { SiteSettingActionResult } from "@/types/actions";

const initialState: SiteSettingActionResult = { success: false };

type PromoBannerEditorProps = {
  initialText: string;
};

export function PromoBannerEditor({ initialText }: PromoBannerEditorProps) {
  const [state, formAction, isPending] = useActionState(
    updatePromoBannerText,
    initialState
  );

  return (
    <form action={formAction} className="rounded-2xl border border-border p-5">
      <label htmlFor="promoText" className="block font-medium">
        Promo banner copy
      </label>
      <p className="mt-1 text-sm text-muted">
        Shown when the countdown sale banner toggle is enabled.
      </p>
      <textarea
        id="promoText"
        name="promoText"
        rows={2}
        defaultValue={state.value ?? initialText}
        className="mt-4 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={isPending}
        className="mt-4 inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm text-background disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save promo text"}
      </button>
      {state.success && (
        <p className="mt-2 text-sm text-green-700">Promo text updated.</p>
      )}
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
