const SAFE_RETURN_PREFIXES = [
  "/dashboard",
  "/chat",
  "/billing",
  "/experts",
  "/expert/profile",
  "/expert/dna",
  "/admin",
] as const;

export function isSafeAuthReturnPath(next: string) {
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return false;
  }

  return SAFE_RETURN_PREFIXES.some(
    (prefix) => next === prefix || next.startsWith(`${prefix}/`),
  );
}
