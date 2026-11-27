import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/master-admin/auth";
import { listSubkeeper } from "@/lib/master-admin/products";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  try {
    const data = await listSubkeeper(new URL(request.url));
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    console.error("[admin/console/subkeeper]", error);
    return NextResponse.json({ error: "無法載入訂閱管家" }, { status: 500 });
  }
}
