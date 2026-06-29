"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export type HeaderCategory = {
  slug: string;
  displayName: string;
};

type SiteHeaderNavProps = {
  categories: HeaderCategory[];
  showAdminLink: boolean;
};

function navLinkClass(isActive: boolean) {
  return isActive
    ? "text-sm font-medium text-foreground"
    : "text-sm text-muted transition-colors hover:text-foreground";
}

export function SiteHeaderNav({ categories, showAdminLink }: SiteHeaderNavProps) {
  const pathname = usePathname();
  const onDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const onLookbooks =
    pathname === "/lookbook" || pathname.startsWith("/lookbook/");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-medium tracking-[0.2em] uppercase">
          Curated
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <SignedIn>
            <Link href="/dashboard" className={navLinkClass(onDashboard)}>
              Saved looks
            </Link>
          </SignedIn>
          <Link href="/lookbook" className={navLinkClass(onLookbooks)}>
            Lookbooks
          </Link>
          <SignedOut>
            {categories.slice(0, 3).map((category) => (
              <Link
                key={category.slug}
                href={`/lookbook/${category.slug}`}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {category.displayName}
              </Link>
            ))}
          </SignedOut>
          <SignedIn>
            {showAdminLink && (
              <Link
                href="/admin"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Admin
              </Link>
            )}
          </SignedIn>
        </nav>

        <div className="flex items-center gap-3">
          <SignedIn>
            <Link href="/dashboard" className={`md:hidden ${navLinkClass(onDashboard)}`}>
              Saved
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm text-muted transition-colors hover:text-foreground">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90">
                Join
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
