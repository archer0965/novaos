import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  seller_id: z.string().uuid(),
  service_id: z.string().uuid(),
  customer_name: z.string().trim().min(1).max(40),
  customer_phone: z
    .string()
    .trim()
    .regex(/^09\d{8}$/, "請輸入正確手機（09 開頭 10 碼）"),
  starts_at: z.string().min(10),
  note: z.string().trim().max(300).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "資料無效" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: service, error: serviceError } = await admin
      .from("booking_services")
      .select("id, seller_id, duration_minutes, buffer_minutes, is_active, price")
      .eq("id", parsed.data.service_id)
      .eq("seller_id", parsed.data.seller_id)
      .maybeSingle();

    if (serviceError || !service || !service.is_active) {
      return NextResponse.json({ error: "找不到服務" }, { status: 404 });
    }

    const starts = new Date(parsed.data.starts_at);
    if (Number.isNaN(starts.getTime()) || starts.getTime() < Date.now()) {
      return NextResponse.json({ error: "預約時間無效" }, { status: 400 });
    }

    const ends = new Date(
      starts.getTime() +
        (service.duration_minutes + service.buffer_minutes) * 60_000
    );

    // Anti-collision: overlap with existing booked appointments
    const { data: conflicts } = await admin
      .from("booking_appointments")
      .select("id")
      .eq("seller_id", parsed.data.seller_id)
      .eq("status", "booked")
      .lt("starts_at", ends.toISOString())
      .gt("ends_at", starts.toISOString())
      .limit(1);

    if (conflicts?.length) {
      return NextResponse.json(
        { error: "此時段已被預約（含防撞緩衝），請改選其他時間" },
        { status: 409 }
      );
    }

    const { data, error } = await admin
      .from("booking_appointments")
      .insert({
        seller_id: parsed.data.seller_id,
        service_id: service.id,
        customer_name: parsed.data.customer_name,
        customer_phone: parsed.data.customer_phone,
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        status: "booked",
        pay_mode: "pay_at_store",
        note: parsed.data.note || null,
      })
      .select("id, starts_at, ends_at")
      .single();

    if (error) {
      console.error("[booking/appointments]", error);
      return NextResponse.json({ error: "預約失敗" }, { status: 500 });
    }

    // Post-insert recheck: close TOCTOU race if another booking landed in the same window.
    const { data: afterConflicts } = await admin
      .from("booking_appointments")
      .select("id")
      .eq("seller_id", parsed.data.seller_id)
      .eq("status", "booked")
      .lt("starts_at", ends.toISOString())
      .gt("ends_at", starts.toISOString());

    if ((afterConflicts?.length || 0) > 1) {
      await admin.from("booking_appointments").delete().eq("id", data.id);
      return NextResponse.json(
        { error: "此時段剛被預約，請改選其他時間" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      appointment: data,
      message: "預約成功！請於現場付款（免訂金）",
      amount: service.price,
    });
  } catch (error) {
    console.error("[booking/appointments]", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
