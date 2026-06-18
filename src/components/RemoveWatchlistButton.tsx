"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { removeFromWatchlist } from "@/app/actions/watchlist";

type RemoveWatchlistButtonProps = {
  watchlistId: number;
};

export function RemoveWatchlistButton({ watchlistId }: RemoveWatchlistButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(() => {
      void removeFromWatchlist(watchlistId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      aria-label="Remove from watchlist"
      className="rounded-full p-2 text-muted transition-colors hover:bg-neutral-100 hover:text-foreground disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
