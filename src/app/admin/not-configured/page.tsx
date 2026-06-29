import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSoleAdminUserId, isAdminUser } from "@/lib/admin";

export const metadata = {
  title: "Admin not configured",
};

export default async function AdminNotConfiguredPage() {
  const { userId, sessionClaims } = await auth();

  if (userId && isAdminUser(userId, sessionClaims) && getSoleAdminUserId()) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm tracking-[0.25em] text-muted uppercase">Setup</p>
      <h1 className="mt-4 text-3xl font-light tracking-tight">Admin not configured</h1>
      <p className="mt-4 text-muted leading-relaxed">
        The admin dashboard is locked until{" "}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">
          ALLOWED_ADMIN_IDS
        </code>{" "}
        is set in <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">.env.local</code>{" "}
        with your Clerk user ID.
      </p>
      <ol className="mt-6 space-y-2 text-left text-sm text-muted">
        <li>1. Sign up once at <strong className="text-foreground">/sign-up</strong></li>
        <li>2. Copy your User ID from Clerk Dashboard → Users</li>
        <li>3. Add <code className="text-xs">ALLOWED_ADMIN_IDS=user_...</code></li>
        <li>4. Restart the dev server</li>
      </ol>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm text-background"
      >
        Back home
      </Link>
    </div>
  );
}
