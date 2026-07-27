"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type LinkItem = { href: string; label: string };

export function RoleShellHeader({
  title,
  links,
}: {
  title: string;
  links: LinkItem[];
}) {
  const [email, setEmail] = useState<string | null>(null);

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

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <div className="flex min-w-0 items-center gap-4">
        <Link
          href="/"
          className="font-display text-lg text-ink transition-colors hover:text-accent"
        >
          WeStartup
        </Link>
        <span className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
          {title}
        </span>
        <nav className="flex gap-3 text-sm text-ink-tertiary">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {email ? (
          <p
            className="hidden max-w-[200px] truncate text-xs text-ink-tertiary md:block"
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
