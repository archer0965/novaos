import { NextResponse } from "next/server";
import {
  STATS_RANGES,
  listDateKeys,
  sumStats,
  type StatsRange,
} from "@/lib/analytics";
import { readMetricsForDates } from "@/lib/analytics-store";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE}=`))
    ?.slice(ADMIN_COOKIE.length + 1);

  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") || "1d") as StatsRange;
  const selected =
    STATS_RANGES.find((item) => item.id === range) || STATS_RANGES[0];

  const dates = listDateKeys(selected.days);
  const daily = await readMetricsForDates(dates);
  const totals = sumStats(daily);

  return NextResponse.json(
    {
      range: selected.id,
      label: selected.label,
      totals,
      daily,
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
