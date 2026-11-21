import { NextResponse } from "next/server";
import { sanitizeNextPath } from "@/lib/safe-next";
import { getSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

/**
 * Prefer the public production host over request.url origin when proxies
 * (or connection reuse) would otherwise produce a mismatched Host / redirect.
 */
function resolveAppOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();
    if (host && !host.endsWith(".vercel.app")) {
      return `${forwardedProto}://${host}`;
    }
  }
  try {
    const { host } = new URL(request.url);
    if (host && !host.endsWith(".vercel.app")) {
      return `${forwardedProto}://${host}`;
    }
  } catch {
    /* fall through */
  }
  return getSiteUrl();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));
  const origin = resolveAppOrigin(request);

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
