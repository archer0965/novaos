import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/master-admin/auth";
import { listBooking, listBookingServices } from "@/lib/master-admin/products";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  try {
    const [appointments, services] = await Promise.all([
      listBooking(new URL(request.url)),
      listBookingServices(),
    ]);
    return NextResponse.json({ ok: true, appointments, services });
  } catch (error) {
    console.error("[admin/console/booking]", error);
    return NextResponse.json({ error: "無法載入拓脈預約" }, { status: 500 });
  }
}
