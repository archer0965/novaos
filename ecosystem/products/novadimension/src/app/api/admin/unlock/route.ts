import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminToken } from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const limited = rateLimit(`admin-unlock:${clientKey(request)}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "請稍後再試" }, { status: 429 });
  }

  const token = createAdminToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
