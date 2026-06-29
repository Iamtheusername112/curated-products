"use client";

import Link from "next/link";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { PAGE_CONTAINER } from "@/lib/layout-classes";

export function PriceTrackerBanner() {
  return (
    <section className="border-b border-border bg-neutral-100">
      <div
        className={`${PAGE_CONTAINER} flex flex-col items-start justify-between gap-4 py-5 md:flex-row md:items-center`}
      >
        <div>
          <p className="text-xs tracking-[0.2em] text-muted uppercase">
            Smart shopping
          </p>
          <p className="mt-1 text-sm text-foreground md:text-base">
            Save pieces you love — buy only when the price drops.
          </p>
        </div>

        <SignedOut>
          <SignUpButton mode="modal">
            <button
              type="button"
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Start tracking free
            </button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <Link
            href="/dashboard"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            View saved looks
          </Link>
        </SignedIn>
      </div>
    </section>
  );
}
