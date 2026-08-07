const STORAGE_KEY = "ws_return_to";

const ALLOWED_PREFIXES = [
  "/chat",
  "/dashboard",
  "/billing",
  "/experts",
  "/admin",
  "/expert",
  "/onboarding",
];

export function rememberDirectoryReturn(pathname?: string) {
  if (typeof window === "undefined") return;
  const path = pathname ?? window.location.pathname;
  if (!isAllowedReturnPath(path)) return;
  sessionStorage.setItem(STORAGE_KEY, path);
}

export function readDirectoryReturn(): { href: string; label: string } {
  if (typeof window === "undefined") {
    return { href: "/chat", label: "Back to workspace" };
  }

  const stored = sessionStorage.getItem(STORAGE_KEY);
  const href = resolveReturnHref(stored);
  return { href, label: labelForReturn(href) };
}

function isAllowedReturnPath(path: string) {
  return ALLOWED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function resolveReturnHref(stored: string | null) {
  if (stored && isAllowedReturnPath(stored)) return stored;
  if (stored?.startsWith("/admin")) return "/admin";
  if (stored?.startsWith("/expert")) return "/expert/dna";
  return "/chat";
}

function labelForReturn(href: string) {
  if (href === "/dashboard" || href.startsWith("/dashboard/")) {
    return "Back to dashboard";
  }
  return "Back to workspace";
}
