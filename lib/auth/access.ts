import type { ExpertApplicationStatus, PlatformRole } from "@/lib/types/roles";

export type AccessSnapshot = {
  role: PlatformRole;
  firstLogin: boolean;
  applicationStatus: ExpertApplicationStatus | null;
  founderContinuedAt: string | null;
};

/** Resolve post-auth home path from role + application state. */
export function homePathForAccess(access: AccessSnapshot): string {
  if (access.role === "admin") return "/admin";
  if (access.role === "expert") return "/expert/dna";

  if (access.applicationStatus === "pending") return "/expert/pending";
  if (
    access.applicationStatus === "rejected" &&
    !access.founderContinuedAt
  ) {
    return "/expert/rejected";
  }

  if (access.firstLogin) return "/onboarding";
  return "/chat";
}

export function isFounderProductPath(pathname: string): boolean {
  return (
    pathname.startsWith("/chat") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/experts") ||
    pathname.startsWith("/onboarding")
  );
}

export function isAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export function isExpertPath(pathname: string): boolean {
  return pathname.startsWith("/expert");
}
