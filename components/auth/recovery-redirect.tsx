"use client";

import { useEffect } from "react";

/**
 * Safety net: if a recovery email falls back to Site URL (/) with a hash or
 * type=recovery query, forward the user to the reset-password page.
 */
export function RecoveryRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const { pathname, search, hash } = window.location;
    if (pathname.startsWith("/reset-password")) return;

    const params = new URLSearchParams(search);
    const type = params.get("type");
    const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
    const hashType = hashParams.get("type");
    const isRecovery =
      type === "recovery" ||
      hashType === "recovery" ||
      hash.includes("type=recovery");

    if (!isRecovery) return;

    const next = new URL("/reset-password", window.location.origin);
    if (search) {
      const cleaned = new URLSearchParams(search);
      cleaned.delete("type");
      const qs = cleaned.toString();
      if (qs) next.search = qs;
    }
    if (hash) next.hash = hash;
    window.location.replace(next.pathname + next.search + next.hash);
  }, []);

  return null;
}
