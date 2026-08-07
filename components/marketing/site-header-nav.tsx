"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#product", label: "Product" },
  { href: "/companies", label: "Directory" },
  { href: "/#proof", label: "Proof" },
  { href: "/#positioning", label: "Approach" },
] as const;

export function SiteHeaderNav() {
  const pathname = usePathname();

  return (
    <nav
      className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex"
      aria-label="Primary"
    >
      {NAV.map((item) => {
        const active =
          item.href === "/companies" && pathname.startsWith("/companies");
        const className = cn(
          "text-sm transition-colors hover:text-[var(--mkt-ink)]",
          active ? "text-[var(--mkt-ink)]" : "text-[var(--mkt-muted)]",
        );
        return item.href.startsWith("/#") ? (
          <a key={item.href} href={item.href} className={className}>
            {item.label}
          </a>
        ) : (
          <Link key={item.href} href={item.href} prefetch className={className}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteHeaderMobileDirectory() {
  const pathname = usePathname();
  return (
    <Link
      href="/companies"
      prefetch
      className={cn(
        "text-sm transition-colors hover:text-[var(--mkt-ink)] md:hidden",
        pathname.startsWith("/companies")
          ? "text-[var(--mkt-ink)]"
          : "text-[var(--mkt-muted)]",
      )}
    >
      Directory
    </Link>
  );
}
