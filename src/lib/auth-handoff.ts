/** Shared helpers for cross-site session handoff after hub login. */

import {
  isAbsoluteTrustedReturn,
  isTrustedReturnOrigin,
} from "@/lib/trusted-returns";

/**
 * If `absoluteReturn` already points at a product `/auth/receive`, keep it.
 * Otherwise wrap the destination as `/auth/receive?next=<path>`.
 */
export function toProductReceiveUrl(absoluteReturn: string): string {
  const u = new URL(absoluteReturn);
  if (!isTrustedReturnOrigin(u.origin)) {
    throw new Error("Untrusted return origin");
  }
  const path = u.pathname.replace(/\/$/, "") || "/";
  if (path === "/auth/receive") {
    return `${u.origin}/auth/receive${u.search}${u.hash}`;
  }
  const nextPath = `${u.pathname || "/"}${u.search || ""}${u.hash || ""}` || "/";
  const receive = new URL("/auth/receive", u.origin);
  receive.searchParams.set("next", nextPath);
  return receive.toString();
}

export function buildSessionHash(session: {
  access_token: string;
  refresh_token: string;
  expires_in?: number | null;
}): string {
  const hash = new URLSearchParams({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: String(session.expires_in ?? 3600),
    token_type: "bearer",
    type: "recovery",
  });
  return hash.toString();
}

export function handoffAssignUrl(
  absoluteOrRelativeNext: string,
  session: {
    access_token: string;
    refresh_token: string;
    expires_in?: number | null;
  } | null
): string | null {
  if (!isAbsoluteTrustedReturn(absoluteOrRelativeNext)) return null;
  if (!session?.access_token || !session.refresh_token) {
    return absoluteOrRelativeNext;
  }
  const target = toProductReceiveUrl(absoluteOrRelativeNext);
  return `${target}#${buildSessionHash(session)}`;
}
