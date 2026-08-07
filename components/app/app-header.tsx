"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { rememberDirectoryReturn } from "@/lib/directory/return-path";

type Props = {
  active: "chat" | "dashboard" | "billing" | "experts" | "directory";
};

export function AppHeader({ active }: Props) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setEmail(session?.user?.email ?? null);
      } catch {
        setEmail(null);
      }
    })();
  }, []);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <div className="flex min-w-0 items-center gap-4">
        <Link
          href="/"
          className="font-display text-lg text-ink transition-colors hover:text-accent"
        >
          WeStartup
        </Link>
        <nav className="flex gap-3 text-sm text-ink-tertiary">
          <Link
            href="/chat"
            prefetch
            className={active === "chat" ? "text-ink" : "hover:text-ink"}
          >
            Chat
          </Link>
          <Link
            href="/dashboard"
            prefetch
            className={active === "dashboard" ? "text-ink" : "hover:text-ink"}
          >
            Dashboard
          </Link>
          <Link
            href="/billing"
            prefetch
            className={active === "billing" ? "text-ink" : "hover:text-ink"}
          >
            Billing
          </Link>
          <Link
            href="/experts"
            prefetch
            className={active === "experts" ? "text-ink" : "hover:text-ink"}
          >
            Meet your experts
          </Link>
          <Link
            href="/companies"
            prefetch
            className={active === "directory" ? "text-ink" : "hover:text-ink"}
            onClick={() => rememberDirectoryReturn()}
          >
            Directory
          </Link>
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
    </header>
  );
}
