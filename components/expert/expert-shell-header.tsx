"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/expert/dna", label: "DNA Studio" },
  { href: "/expert", label: "Assignments", exact: true },
  { href: "/expert/profile", label: "Profile" },
  { href: "/expert/notifications", label: "Notifications" },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) {
    return (
      pathname === href ||
      pathname.startsWith("/expert/assignments")
    );
  }
  if (href === "/expert/dna") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ExpertShellHeader({
  unreadNotifications = 0,
}: {
  unreadNotifications?: number;
}) {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const gateOnly =
    pathname.startsWith("/expert/pending") ||
    pathname.startsWith("/expert/apply") ||
    pathname.startsWith("/expert/rejected");

  useEffect(() => {
    void (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setEmail(user?.email ?? null);
      } catch {
        setEmail(null);
      }
    })();
  }, []);

  if (gateOnly) {
    return (
      <header className="border-b border-border px-4 py-3">
        <Link href="/" className="font-display text-lg text-ink">
          WeStartup
        </Link>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 md:px-5">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/expert/dna"
            className="shrink-0 font-display text-lg text-ink"
          >
            WeStartup
            <span className="ml-2 font-sans text-xs font-medium uppercase tracking-wide text-ink-tertiary">
              Expert
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Expert">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-[var(--radius-md)] px-2.5 py-1.5 text-sm transition-colors",
                  isActive(pathname, item.href, "exact" in item && item.exact)
                    ? "text-ink"
                    : "text-ink-secondary hover:text-ink",
                )}
              >
                {item.label}
                {item.href === "/expert/notifications" &&
                unreadNotifications > 0 ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-[var(--radius-sm)] bg-challenge/15 px-1.5 text-[10px] font-semibold text-challenge">
                    {unreadNotifications}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {email ? (
            <p className="hidden max-w-[160px] truncate text-xs text-ink-tertiary md:block">
              {email}
            </p>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            onClick={async () => {
              const { createClient } = await import("@/lib/supabase/client");
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
      <nav
        className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 sm:hidden"
        aria-label="Expert mobile"
      >
        {LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 px-2 py-1 text-xs",
              isActive(pathname, item.href, "exact" in item && item.exact)
                ? "text-ink"
                : "text-ink-tertiary",
            )}
          >
            {item.label}
            {item.href === "/expert/notifications" && unreadNotifications > 0
              ? ` (${unreadNotifications})`
              : ""}
          </Link>
        ))}
      </nav>
    </header>
  );
}
