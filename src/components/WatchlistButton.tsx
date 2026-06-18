"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { toggleWatchlist } from "@/app/actions/watchlist";

type WatchlistButtonProps = {
  productId: number;
  isWatchlisted: boolean;
};

export function WatchlistButton({
  productId,
  isWatchlisted: initialWatchlisted,
}: WatchlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isWatchlisted, setIsWatchlisted] = useState(initialWatchlisted);

  function handleToggle() {
    startTransition(() => {
      void toggleWatchlist(productId).then((result) => {
        if (result.success && result.isWatchlisted !== undefined) {
          setIsWatchlisted(result.isWatchlisted);
        }
      });
    });
  }

  return (
    <>
      <SignedIn>
        <button
          type="button"
          aria-label={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
          disabled={isPending}
          onClick={handleToggle}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:scale-105 disabled:opacity-50"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWatchlisted ? "fill-red-500 text-red-500" : "text-neutral-700"
            }`}
          />
        </button>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button
            type="button"
            aria-label="Sign in to save to watchlist"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:scale-105"
          >
            <Heart className="h-4 w-4 text-neutral-700" />
          </button>
        </SignInButton>
      </SignedOut>
    </>
  );
}
