import { NextResponse, type NextRequest } from "next/server";
import type { AccessSnapshot } from "@/lib/auth/access";
import type { ExpertApplicationStatus, PlatformRole } from "@/lib/types/roles";

export const ACCESS_COOKIE = "ws_gate";
const ACCESS_TTL_MS = 45_000;

type GatePayload = {
  u: string;
  r: PlatformRole;
  f: 0 | 1;
  a: ExpertApplicationStatus | "";
  c: string;
  e: number;
};

export function readAccessGate(
  request: NextRequest,
  userId: string,
): AccessSnapshot | null {
  const raw = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!raw) return null;
  try {
    const payload = JSON.parse(decodeURIComponent(raw)) as GatePayload;
    if (payload.u !== userId || Date.now() > payload.e) return null;
    return {
      role: payload.r,
      firstLogin: Boolean(payload.f),
      applicationStatus: payload.a || null,
      founderContinuedAt: payload.c || null,
    };
  } catch {
    return null;
  }
}

export function writeAccessGate(
  response: NextResponse,
  userId: string,
  access: AccessSnapshot,
) {
  const payload: GatePayload = {
    u: userId,
    r: access.role,
    f: access.firstLogin ? 1 : 0,
    a: access.applicationStatus ?? "",
    c: access.founderContinuedAt ?? "",
    e: Date.now() + ACCESS_TTL_MS,
  };
  response.cookies.set(ACCESS_COOKIE, encodeURIComponent(JSON.stringify(payload)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60,
  });
}

export function clearAccessGate(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function readAuthJwtClaims(
  request: NextRequest,
): { sub: string; expMs: number } | null {
  const parts = request.cookies
    .getAll()
    .filter(
      (cookie) =>
        cookie.name.includes("-auth-token") &&
        !cookie.name.includes("code-verifier"),
    )
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    );

  if (!parts.length) return null;

  const raw = parts.map((part) => part.value).join("");

  try {
    let json = raw;
    if (raw.startsWith("base64-")) {
      json = decodeURIComponent(escape(atob(raw.slice("base64-".length))));
    }
    const session = JSON.parse(json) as {
      access_token?: string;
      expires_at?: number;
      user?: { id?: string };
    };

    if (session.access_token) {
      const payloadSeg = session.access_token.split(".")[1];
      if (payloadSeg) {
        const padded = payloadSeg.replace(/-/g, "+").replace(/_/g, "/");
        const claims = JSON.parse(atob(padded)) as {
          sub?: string;
          exp?: number;
        };
        if (claims.sub && claims.exp) {
          return { sub: claims.sub, expMs: claims.exp * 1000 };
        }
      }
    }

    if (session.user?.id && session.expires_at) {
      return { sub: session.user.id, expMs: session.expires_at * 1000 };
    }
  } catch {
    return null;
  }

  return null;
}
