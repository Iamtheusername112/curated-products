import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { WatchlistItemCard } from "@/components/account/WatchlistItemCard";
import { getUserWatchlistEntries } from "@/lib/watchlist-queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [entries, user] = await Promise.all([
    getUserWatchlistEntries(userId),
    currentUser(),
  ]);

  const savedItems = entries;
  const firstName = user?.firstName?.trim() || "there";
  const latestSavedAt = savedItems[0]?.createdAt;

  return (
    <div>
      <div className="mb-8 md:mb-10">
        <p className="text-xs tracking-[0.25em] text-muted uppercase">Saved looks</p>
        <h1 className="mt-3 text-2xl font-light tracking-tight sm:text-3xl md:text-4xl">
          {firstName}&apos;s watchlist
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Every piece you save is stored in your account and persists across sign-ins.
          {latestSavedAt && savedItems.length > 0 && (
            <>
              {" "}
              Last saved{" "}
              {latestSavedAt.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              .
            </>
          )}
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-xs tracking-[0.2em] text-muted uppercase">Saved items</p>
          <p className="mt-2 text-3xl font-light">{savedItems.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-xs tracking-[0.2em] text-muted uppercase">Status</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {savedItems.length > 0
              ? "Synced with Neon Postgres — safe after refresh or re-login."
              : "Save items while browsing to start tracking."}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 sm:flex sm:flex-col sm:justify-between">
          <p className="text-xs tracking-[0.2em] text-muted uppercase">Quick action</p>
          <Link
            href="/lookbook"
            className="mt-3 inline-flex text-sm font-medium underline underline-offset-4"
          >
            Discover new looks
          </Link>
        </div>
      </div>

      {savedItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
          <p className="text-lg font-light">No saved looks yet</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Tap the heart on any product while browsing. Your watchlist will show up
            here — separate from the public storefront.
          </p>
          <Link
            href="/lookbook"
            className="mt-8 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm text-background"
          >
            Browse lookbooks
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {savedItems.map((entry) => (
            <WatchlistItemCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
