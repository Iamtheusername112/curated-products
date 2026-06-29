"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Saved looks" },
  { href: "/lookbook", label: "Browse lookbooks" },
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account"
      className="mb-8 flex gap-1 overflow-x-auto border-b border-border pb-px md:mb-10"
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard" || pathname.startsWith("/dashboard/")
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm transition-colors ${
              isActive
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
