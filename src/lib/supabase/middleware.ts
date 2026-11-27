import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authCookieOptions } from "@/lib/supabase/cookie-options";
import {
  isAbsoluteTrustedReturn,
  resolveAuthNext,
} from "@/lib/trusted-returns";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: authCookieOptions,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Touches / refreshes the session from cookies (writes Set-Cookie when needed).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isHome = path === "/";
  const isDashboard = path.startsWith("/dashboard");
  const isAuthPage = path === "/login" || path === "/signup";

  if (isDashboard && !user) {
    // Relative redirect only — never rewrite Host (avoids 421 / misdirected hosts).
    const url = request.nextUrl.clone();
    const returnPath = `${path}${request.nextUrl.search}`;
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", returnPath);
    return NextResponse.redirect(url);
  }

  // Already signed in: skip marketing / auth screens and open the app shell.
  // Absolute product returns go through /auth/handoff so session tokens can be attached.
  if (user && (isHome || isAuthPage)) {
    const dest = isAuthPage
      ? resolveAuthNext(request.nextUrl.searchParams.get("next"))
      : "/dashboard";
    const url = request.nextUrl.clone();
    if (isAbsoluteTrustedReturn(dest)) {
      url.pathname = "/auth/handoff";
      url.search = "";
      url.searchParams.set("next", dest);
      return NextResponse.redirect(url);
    }
    const target = new URL(
      dest.startsWith("/") ? dest : "/dashboard",
      request.nextUrl.origin
    );
    url.pathname = target.pathname;
    url.search = target.search;
    url.hash = target.hash;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
