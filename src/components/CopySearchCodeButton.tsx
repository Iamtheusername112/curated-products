"use client";

import { useState } from "react";

type CopySearchCodeButtonProps = {
  code: string;
};

export function CopySearchCodeButton({ code }: CopySearchCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mt-3 w-full rounded-full bg-neutral-950 px-4 py-2.5 text-xs font-medium tracking-wide text-white transition-opacity hover:opacity-90"
    >
      {copied ? "Copied!" : "Copy shopping code"}
    </button>
  );
}
