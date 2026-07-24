"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#product", label: "Product" },
  { href: "#proof", label: "Proof" },
  { href: "#positioning", label: "Approach" },
  { href: "#resources", label: "Resources" },
] as const;

export function SiteHeader() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("mkt-nav sticky top-0 z-40", solid && "is-solid")}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:h-16">
        <Link
          href="/"
          className="font-display text-lg text-[var(--mkt-ink)]"
          aria-label="WeStartup home"
        >
          WeStartup
        </Link>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex"
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-[var(--mkt-muted)] transition-colors hover:text-[var(--mkt-ink)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <Link
            href="/login"
            className="hidden text-sm text-[var(--mkt-muted)] transition-colors hover:text-[var(--mkt-ink)] sm:inline"
          >
            Log in
          </Link>
          <Link href="/signup" className="mkt-btn-primary !px-3.5 !py-1.5 text-sm">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
