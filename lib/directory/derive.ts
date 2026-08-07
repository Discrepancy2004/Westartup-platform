export function deriveListingName(idea: string): string {
  const trimmed = idea.trim().replace(/\s+/g, " ");
  if (!trimmed) return "Untitled startup";

  const sentence = (trimmed.split(/(?<=[.!?])\s/)[0] ?? trimmed).replace(
    /[.!?]+$/,
    "",
  );
  const words = trimmed.split(" ");

  if (sentence.length > 48 && words.length > 8) {
    return words.slice(0, 6).join(" ");
  }

  if (sentence.length <= 60) return sentence || "Untitled startup";

  const clipped = trimmed.slice(0, 57).replace(/\s+\S*$/, "").trim();
  return clipped || "Untitled startup";
}

export function deriveTagline(idea: string): string {
  const trimmed = idea.trim().replace(/\s+/g, " ");
  if (!trimmed) return "A verified WeStartup company.";
  if (trimmed.length <= 140) return trimmed;
  return `${trimmed.slice(0, 137).replace(/\s+\S*$/, "").trim()}…`;
}

export function slugifyListing(name: string, founderId: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "startup";
  const suffix = founderId.replace(/-/g, "").slice(0, 8);
  return `${base}-${suffix}`;
}

export function listingInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => /[a-z0-9]/i.test(part));
  if (parts.length === 0) return "WS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
