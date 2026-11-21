import Link from "next/link";
import { CalendarClock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireModuleOrGate } from "@/lib/require-module";
import { PAYMENT_GATEWAY_STATUS } from "@/lib/novaos";
import { getSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "拓脈預約" };

export default async function BookingDashboardPage() {
  const access = await requireModuleOrGate("booking");
  if (!access.ok) return access.gate;

  const { userId, profile } = access;
  const supabase = createClient();

  const [{ data: services }, { data: appointments }] = await Promise.all([
    supabase
      .from("booking_services")
      .select("id, title, duration_minutes, price, offpeak_discount_pct, buffer_minutes, is_active")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("booking_appointments")
      .select("id, customer_name, customer_phone, starts_at, ends_at, status, pay_mode, note")
      .eq("seller_id", userId)
      .order("starts_at", { ascending: true })
      .limit(30),
  ]);

  const slug = profile.shop_slug || profile.id;
  const publicUrl = `${getSiteUrl()}/booking/${slug}`;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/80 bg-gradient-to-br from-sky-50 via-background to-emerald-50/40 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">📅 拓脈預約 · Nova Booking</p>
            <h1 className="mt-1 font-display text-2xl font-semibold">美業極速預約中台</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              10 秒預約、防撞緩衝、離峰折扣。方案升級採
              {PAYMENT_GATEWAY_STATUS.activeLabel}。
            </p>
          </div>
          <Button asChild className="h-11">
            <Link href="/dashboard/booking/services">
              <Plus className="mr-1.5 h-4 w-4" />
              新增服務
            </Link>
          </Button>
        </div>
        <div className="mt-4 rounded-xl bg-background/80 px-4 py-3 text-sm">
          <p className="text-muted-foreground">公開預約頁</p>
          <code className="mt-1 block break-all">{publicUrl}</code>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={publicUrl} target="_blank" rel="noreferrer">
                開啟
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">服務項目</h2>
        {!services?.length ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            尚未建立服務。先新增剪髮／美甲等項目，買家即可線上預約。
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <li
                key={s.id}
                className="rounded-2xl border border-border/80 bg-card/80 p-4"
              >
                <p className="font-medium">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.duration_minutes} 分 · NT${s.price}
                  {s.offpeak_discount_pct
                    ? ` · 離峰折 ${s.offpeak_discount_pct}%`
                    : ""}
                  · 緩衝 {s.buffer_minutes} 分
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <CalendarClock className="h-5 w-5" />
          近期預約
        </h2>
        {!appointments?.length ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            尚無預約。分享公開連結給客人即可開始接單。
          </p>
        ) : (
          <ul className="space-y-2">
            {appointments.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {a.customer_name} · {a.customer_phone}
                  </p>
                  <p className="text-muted-foreground">
                    {new Date(a.starts_at).toLocaleString("zh-TW", {
                      timeZone: "Asia/Taipei",
                    })}
                    {" — "}
                    {a.status} · {a.pay_mode === "pay_at_store" ? "現場付" : a.pay_mode}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
