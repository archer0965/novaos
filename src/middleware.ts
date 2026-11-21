import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Intentionally no Host / subdomain forcing here.
  // Absolute cross-host redirects can trigger Vercel 421 Misdirected Request
  // under HTTP/2 connection reuse; keep all redirects relative to nextUrl.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const path = request.nextUrl.pathname;
    if (path.startsWith("/dashboard")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return updateSession(request);
}

/**
 * Auth session refresh + logged-in home redirect.
 * Buyer report pages (`/p/*`) stay out for faster TTFB.
 */
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/admin/:path*",
    "/subkeeper",
    "/login",
    "/signup",
    "/auth/:path*",
  ],
};
