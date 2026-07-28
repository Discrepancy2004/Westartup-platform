"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdminNavCounts } from "@/lib/admin/counts";
import { cn } from "@/lib/utils";

type Props = {
  counts: AdminNavCounts;
};

const PRIMARY = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/founders", label: "Founders" },
  { href: "/admin/knowledge", label: "Knowledge Base" },
  { href: "/admin/analytics", label: "Analytics" },
] as const;

const EXPERT_LINKS = [
  { href: "/admin/experts", label: "All Experts", badge: null },
  {
    href: "/admin/experts/applications",
    label: "Applications",
    badge: "pendingApplications" as const,
  },
  {
    href: "/admin/experts/assignments",
    label: "Assignments",
    badge: "pendingReviews" as const,
  },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminHeader({ counts }: Props) {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [expertsOpen, setExpertsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const expertsActive = pathname.startsWith("/admin/experts");

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

  useEffect(() => {
    setExpertsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setExpertsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:h-16 md:px-5">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/admin" className="shrink-0 font-display text-lg text-ink">
            WeStartup
            <span className="ml-2 text-xs font-sans font-medium uppercase tracking-wide text-ink-tertiary">
              Admin
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Admin"
          >
            <Link
              href="/admin"
              className={cn(
                "rounded-[var(--radius-md)] px-2.5 py-1.5 text-sm transition-colors",
                isActive(pathname, "/admin", true)
                  ? "text-ink"
                  : "text-ink-secondary hover:text-ink",
              )}
            >
              Dashboard
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setExpertsOpen((o) => !o)}
                className={cn(
                  "flex items-center gap-1.5 rounded-[var(--radius-md)] px-2.5 py-1.5 text-sm transition-colors",
                  expertsActive || expertsOpen
                    ? "text-ink"
                    : "text-ink-secondary hover:text-ink",
                )}
                aria-expanded={expertsOpen}
              >
                Experts
                {(counts.pendingApplications > 0 ||
                  counts.pendingReviews > 0) && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-[var(--radius-sm)] bg-challenge/15 px-1.5 text-[10px] font-semibold text-challenge">
                    {counts.pendingApplications + counts.pendingReviews}
                  </span>
                )}
                <span className="text-[10px] text-ink-tertiary" aria-hidden>
                  ▾
                </span>
              </button>
              {expertsOpen ? (
                <div className="absolute left-0 top-full z-50 mt-1 w-56 border border-border bg-canvas py-1 shadow-sm">
                  {EXPERT_LINKS.map((item) => {
                    const badge =
                      item.badge === "pendingApplications"
                        ? counts.pendingApplications
                        : item.badge === "pendingReviews"
                          ? counts.pendingReviews
                          : 0;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-surface",
                          isActive(
                            pathname,
                            item.href,
                            item.href === "/admin/experts",
                          )
                            ? "text-accent"
                            : "text-ink-secondary",
                        )}
                      >
                        {item.label}
                        {badge > 0 ? (
                          <span className="text-[10px] font-semibold text-challenge">
                            {badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {PRIMARY.filter((p) => p.href !== "/admin").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-[var(--radius-md)] px-2.5 py-1.5 text-sm transition-colors",
                  isActive(pathname, item.href)
                    ? "text-ink"
                    : "text-ink-secondary hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {email ? (
            <p
              className="hidden max-w-[180px] truncate text-xs text-ink-tertiary md:block"
              title={email}
            >
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

      {/* Compact mobile nav */}
      <nav
        className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 lg:hidden"
        aria-label="Admin mobile"
      >
        <Link
          href="/admin"
          className={cn(
            "shrink-0 px-2 py-1 text-xs",
            isActive(pathname, "/admin", true) ? "text-ink" : "text-ink-tertiary",
          )}
        >
          Dashboard
        </Link>
        {EXPERT_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 px-2 py-1 text-xs",
              isActive(pathname, item.href, item.href === "/admin/experts")
                ? "text-ink"
                : "text-ink-tertiary",
            )}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/admin/founders"
          className={cn(
            "shrink-0 px-2 py-1 text-xs",
            isActive(pathname, "/admin/founders")
              ? "text-ink"
              : "text-ink-tertiary",
          )}
        >
          Founders
        </Link>
      </nav>
    </header>
  );
}
