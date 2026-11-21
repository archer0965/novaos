import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import {
  isAbsoluteTrustedReturn,
  resolveAuthNext,
} from "@/lib/trusted-returns";

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
  const next = resolveAuthNext(searchParams.get("next"));
  const origin = resolveAppOrigin(request);

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (isAbsoluteTrustedReturn(next)) {
        return NextResponse.redirect(next);
      }
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
