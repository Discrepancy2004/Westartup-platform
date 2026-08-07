"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CompanionShell = dynamic(
  () =>
    import("@/components/companion/companion-shell").then(
      (mod) => mod.CompanionShell,
    ),
  { ssr: false },
);

const AskCompanionSelection = dynamic(
  () =>
    import("@/components/companion/ask-selection").then(
      (mod) => mod.AskCompanionSelection,
    ),
  { ssr: false },
);

function companionEnabled(pathname: string) {
  return (
    pathname.startsWith("/dashboard") || pathname.startsWith("/billing")
  );
}

export function CompanionMount() {
  const pathname = usePathname();
  const enabled = companionEnabled(pathname);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      return;
    }
    const win = window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof win.requestIdleCallback === "function") {
      const id = win.requestIdleCallback(() => setReady(true), {
        timeout: 1200,
      });
      return () => win.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  if (!enabled || !ready) return null;

  return (
    <>
      <AskCompanionSelection />
      <CompanionShell />
    </>
  );
}
