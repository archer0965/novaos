import { NextResponse } from "next/server";
import { incrementMetric } from "@/lib/analytics-store";
import { rateLimit } from "@/lib/rate-limit";

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const limited = rateLimit(`visit:${clientKey(request)}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: true });
  }

  await incrementMetric("visits");
  return NextResponse.json({ ok: true });
}
