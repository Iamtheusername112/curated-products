"use client";

import Link from "next/link";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";

export function WatchlistInvitation() {
  return (
    <section className="border-y border-border bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs tracking-[0.25em] text-white/60 uppercase">
            Your saved looks
          </p>
          <h2 className="mt-4 text-2xl font-light tracking-tight sm:text-3xl md:text-4xl">
            Never pay full price for a look you love
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
            Build your dream cart here. We&apos;ll watch the price and nudge you when
            it&apos;s worth buying.
          </p>

          <SignedOut>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-8 text-sm font-medium text-neutral-950 transition-opacity hover:opacity-90"
              >
                Start saving looks
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-8 text-sm font-medium text-neutral-950 transition-opacity hover:opacity-90"
            >
              Open your watchlist
            </Link>
          </SignedIn>
        </div>
      </div>
    </section>
  );
}
