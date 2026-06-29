import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { getSoleAdminUserId } from "@/lib/admin";

export const metadata = {
  title: "Admin access denied",
};

export default async function AdminForbiddenPage() {
  const { userId } = await auth();
  const adminConfigured = Boolean(getSoleAdminUserId());

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm tracking-[0.25em] text-muted uppercase">403</p>
      <h1 className="mt-4 text-3xl font-light tracking-tight">Admin access denied</h1>
      <p className="mt-4 text-muted leading-relaxed">
        {userId ? (
          <>
            The account you&apos;re signed in with is not authorized to manage this
            site. Admin access is limited to a single owner account configured on
            the server.
          </>
        ) : (
          <>
            Sign in with the authorized owner account to open the admin dashboard.
            Creating a new account will not grant admin access.
          </>
        )}
      </p>

      {!adminConfigured && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Server note: <code className="text-xs">ALLOWED_ADMIN_IDS</code> is not
          configured yet. The site owner must set their Clerk user ID in{" "}
          <code className="text-xs">.env.local</code>.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {userId ? (
          <>
            <SignOutButton redirectUrl="/sign-in?redirect_url=/admin&intent=admin">
              <button className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm text-background">
                Sign out & use owner account
              </button>
            </SignOutButton>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm"
            >
              Go to watchlist
            </Link>
          </>
        ) : (
          <Link
            href="/sign-in?redirect_url=/admin&intent=admin"
            className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm text-background"
          >
            Owner sign in
          </Link>
        )}
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
