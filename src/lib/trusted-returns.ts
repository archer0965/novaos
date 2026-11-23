/** Trusted NovaOS product origins for post-login return (cross-site session handoff). */

export const NOVAOS_HUB_ORIGIN = "https://paycheck.com.de";

export const TRUSTED_PRODUCT_ORIGINS = [
  "https://novastore-omega.vercel.app",
  "https://docmate-ai-one.vercel.app",
  "https://taiwanbiz.vercel.app",
  "https://temporary-speedy-reef-cy4xhhu.vercel.app",
  "https://novadimension.vercel.app",
  // Preview aliases occasionally used in docs / bookmarks
  "https://novastore.vercel.app",
  "https://docmate-ai.vercel.app",
] as const;

const LOCAL_DEV_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
] as const;

export function isTrustedReturnOrigin(origin: string): boolean {
  const o = origin.replace(/\/$/, "");
  if (TRUSTED_PRODUCT_ORIGINS.includes(o as (typeof TRUSTED_PRODUCT_ORIGINS)[number])) {
    return true;
  }
  if (process.env.NODE_ENV !== "production") {
    return (LOCAL_DEV_ORIGINS as readonly string[]).includes(o);
  }
  return false;
}

/**
 * Allow relative hub paths OR absolute URLs on trusted product origins.
 * Returns either a relative path ("/dashboard") or absolute trusted URL.
 */
export function resolveAuthNext(
  raw: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!raw) return fallback;
  let next = String(raw).trim();
  try {
    next = decodeURIComponent(next);
  } catch {
    return fallback;
  }
  next = next.trim().replace(/\\/g, "/");

  if (next.startsWith("https://") || next.startsWith("http://")) {
    try {
      const u = new URL(next);
      if (!isTrustedReturnOrigin(u.origin)) return fallback;
      if (u.username || u.password) return fallback;
      return `${u.origin}${u.pathname}${u.search}${u.hash}`;
    } catch {
      return fallback;
    }
  }

  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  if (next.includes("://") || next.includes("@")) return fallback;
  if (/[\x00-\x1f\x7f]/.test(next)) return fallback;
  if (/%2f/i.test(next)) return fallback;
  return next || fallback;
}

export function isAbsoluteTrustedReturn(next: string): boolean {
  return next.startsWith("https://") || next.startsWith("http://");
}

/** Build hub login URL that returns user to a product path after auth. */
export function hubLoginUrl(returnAbsoluteUrl: string, mode: "login" | "signup" = "login"): string {
  const path = mode === "signup" ? "/signup" : "/login";
  return `${NOVAOS_HUB_ORIGIN}${path}?next=${encodeURIComponent(returnAbsoluteUrl)}`;
}
