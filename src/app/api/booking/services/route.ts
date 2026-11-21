import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminEmail } from "@/lib/admin";
import { canOpenModule } from "@/lib/module-access";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

const schema = z.object({
  title: z.string().trim().min(1).max(80),
  duration_minutes: z.coerce.number().int().min(5).max(480),
  price: z.coerce.number().int().min(0).max(999999),
  offpeak_discount_pct: z.coerce.number().int().min(0).max(90).default(0),
  buffer_minutes: z.coerce.number().int().min(0).max(120).default(10),
});

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type, trial_ends_at, expires_at, active_modules")
      .eq("id", user.id)
      .maybeSingle();
    if (
      !profile ||
      !canOpenModule(profile as Profile, "booking", {
        isAdmin: isAdminEmail(user.email),
      })
    ) {
      return NextResponse.json({ error: "方案未包含拓脈預約" }, { status: 403 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "資料無效" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("booking_services")
      .insert({
        seller_id: user.id,
        ...parsed.data,
      })
      .select("*")
      .single();

    if (error) {
      console.error("[booking/services]", error);
      return NextResponse.json(
        { error: "建立失敗（請確認已執行資料庫 migration 024）" },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, service: data });
  } catch (error) {
    console.error("[booking/services]", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
