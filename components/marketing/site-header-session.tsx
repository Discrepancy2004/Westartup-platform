"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readDirectoryReturn } from "@/lib/directory/return-path";

export function SiteHeaderSession() {
  const [email, setEmail] = useState<string | null>(null);
  const [returnTo, setReturnTo] = useState({
    href: "/chat",
    label: "Back to workspace",
  });

  useEffect(() => {
    setReturnTo(readDirectoryReturn());
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

  if (email) {
    return (
      <>
        <p
          className="max-w-[120px] truncate text-sm text-[var(--mkt-muted)] sm:max-w-[180px]"
          title={email}
        >
          {email}
        </p>
        <Link
          href={returnTo.href}
          prefetch
          className="mkt-btn-primary !px-3.5 !py-1.5 text-sm"
        >
          {returnTo.label}
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="text-sm text-[var(--mkt-muted)] transition-colors hover:text-[var(--mkt-ink)]"
      >
        Log in
      </Link>
      <Link href="/signup" className="mkt-btn-primary !px-3.5 !py-1.5 text-sm">
        Get started
      </Link>
    </>
  );
}
