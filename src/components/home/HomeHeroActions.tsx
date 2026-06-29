"use client";

import Link from "next/link";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";

type HomeHeroActionsProps = {
  primaryHref: string;
};

export function HomeHeroActions({ primaryHref }: HomeHeroActionsProps) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      <Link
        href={primaryHref}
        className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-medium text-neutral-950 transition-opacity hover:opacity-90"
      >
        Shop the edit
      </Link>

      <SignedOut>
        <SignUpButton mode="modal">
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-8 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10"
          >
            Track price drops
          </button>
        </SignUpButton>
      </SignedOut>

      <SignedIn>
        <Link
          href="/dashboard"
          className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-8 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10"
        >
          View saved looks
        </Link>
      </SignedIn>
    </div>
  );
}
