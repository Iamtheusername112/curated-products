"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Shopping modes", match: (path: string) => path === "/admin" || path.startsWith("/admin/lookbooks") },
  { href: "/admin/settings", label: "Site settings", match: (path: string) => path.startsWith("/admin/settings") },
  { href: "/admin/shein-ops", label: "Bulk import", match: (path: string) => path.startsWith("/admin/shein-ops") },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-4">
      {LINKS.map((link) => {
        const isActive = link.match(pathname);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              isActive
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
