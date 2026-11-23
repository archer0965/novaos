import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/master-admin/auth";
import {
  buildActivitySeries,
  buildActivityStream,
  buildOverviewKpis,
} from "@/lib/master-admin/overview";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  try {
    const [kpis, activity, series] = await Promise.all([
      buildOverviewKpis(),
      buildActivityStream(40),
      buildActivitySeries(),
    ]);
    return NextResponse.json({ ok: true, kpis, activity, series });
  } catch (error) {
    console.error("[admin/console/overview]", error);
    return NextResponse.json({ error: "無法載入總覽" }, { status: 500 });
  }
}
