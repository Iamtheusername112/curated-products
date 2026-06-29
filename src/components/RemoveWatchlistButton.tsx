"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { removeFromWatchlist } from "@/app/actions/watchlist";

type RemoveWatchlistButtonProps = {
  watchlistId: number;
};

export function RemoveWatchlistButton({ watchlistId }: RemoveWatchlistButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(() => {
      void removeFromWatchlist(watchlistId).then((result) => {
        if (result.success) {
          router.refresh();
        }
      });
    });
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      aria-label="Remove from saved looks"
      className="rounded-full bg-white/95 p-2 text-neutral-700 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
