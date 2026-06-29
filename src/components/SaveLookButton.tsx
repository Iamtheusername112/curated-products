"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { toggleWatchlist } from "@/app/actions/watchlist";

type SaveLookButtonProps = {
  productId: number;
  isWatchlisted: boolean;
  variant?: "icon" | "pill";
  className?: string;
};

export function SaveLookButton({
  productId,
  isWatchlisted: initialWatchlisted,
  variant = "icon",
  className = "",
}: SaveLookButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isWatchlisted, setIsWatchlisted] = useState(initialWatchlisted);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsWatchlisted(initialWatchlisted);
  }, [initialWatchlisted]);

  function handleToggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    setError(null);

    startTransition(() => {
      void toggleWatchlist(productId).then((result) => {
        if (result.success && result.isWatchlisted !== undefined) {
          setIsWatchlisted(result.isWatchlisted);
          router.refresh();
          return;
        }

        setError(result.error ?? "Could not update saved looks");
        setIsWatchlisted(initialWatchlisted);
      });
    });
  }

  const iconButton = (
    <button
      type="button"
      aria-label={isWatchlisted ? "Remove from saved looks" : "Save look"}
      aria-pressed={isWatchlisted}
      disabled={isPending}
      onClick={handleToggle}
      className={
        variant === "icon"
          ? `absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur transition-transform hover:scale-105 disabled:opacity-50 ${className}`
          : `inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium transition-colors disabled:opacity-50 ${
              isWatchlisted
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-border bg-white text-foreground hover:border-foreground"
            } ${className}`
      }
    >
      <Heart
        className={`h-4 w-4 shrink-0 transition-colors ${
          isWatchlisted ? "fill-red-500 text-red-500" : "text-neutral-700"
        }`}
      />
      {variant === "pill" && (isWatchlisted ? "Saved" : "Save look")}
    </button>
  );

  return (
    <>
      <SignedIn>{iconButton}</SignedIn>
      <SignedOut>
        {variant === "icon" ? (
          <SignInButton mode="modal">
            <button
              type="button"
              aria-label="Sign in to save look"
              className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur transition-transform hover:scale-105 ${className}`}
            >
              <Heart className="h-4 w-4 text-neutral-700" />
            </button>
          </SignInButton>
        ) : (
          <SignInButton mode="modal">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-white px-6 text-sm font-medium transition-colors hover:border-foreground"
            >
              <Heart className="h-4 w-4 text-neutral-700" />
              Save look
            </button>
          </SignInButton>
        )}
      </SignedOut>
      {error ? (
        <p
          className={
            variant === "icon"
              ? "absolute right-3 top-14 z-20 max-w-[10rem] rounded-md bg-red-600 px-2 py-1 text-[10px] leading-tight text-white"
              : "mt-2 text-xs text-red-600"
          }
        >
          {error}
        </p>
      ) : null}
    </>
  );
}

/** @deprecated Use SaveLookButton */
export function WatchlistButton(props: SaveLookButtonProps) {
  return <SaveLookButton {...props} />;
}
