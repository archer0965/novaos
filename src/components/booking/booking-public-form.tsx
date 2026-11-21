"use client";

import { FormEvent, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Service = {
  id: string;
  title: string;
  duration_minutes: number;
  price: number;
  offpeak_discount_pct: number;
  buffer_minutes: number;
};

export function BookingPublicForm({
  sellerId,
  services,
}: {
  sellerId: string;
  services: Service[];
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ when: string; amount: number } | null>(
    null
  );
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    starts_local: "",
    note: "",
  });

  const selected = useMemo(
    () => services.find((s) => s.id === serviceId) || null,
    [services, serviceId]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) {
      toast.error("請選擇服務");
      return;
    }
    setLoading(true);
    try {
      const local = new Date(form.starts_local);
      if (Number.isNaN(local.getTime())) throw new Error("請選擇預約時間");
      const res = await fetch("/api/booking/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_id: sellerId,
          service_id: selected.id,
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          starts_at: local.toISOString(),
          note: form.note || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "預約失敗");
      setDone({
        when: local.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }),
        amount: Number(json.amount) || selected.price,
      });
      toast.success(json.message || "預約成功");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "預約失敗");
    } finally {
      setLoading(false);
    }
  }

  if (!services.length) {
    return (
      <p className="rounded-2xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        工作室尚未開放可預約服務。
      </p>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
        <h2 className="font-display text-lg font-semibold text-emerald-950">
          預約成功
        </h2>
        <p className="mt-2 text-sm text-emerald-900/80">
          時間：{done.when}
          <br />
          金額：NT${done.amount}（現場付／免訂金）
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card/80 p-5">
      <div className="space-y-2">
        <Label>選擇服務</Label>
        <div className="grid gap-2">
          {services.map((s) => {
            const active = s.id === serviceId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setServiceId(s.id)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left text-sm",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40"
                )}
              >
                <p className="font-medium">{s.title}</p>
                <p className="text-muted-foreground">
                  {s.duration_minutes} 分 · NT${s.price}
                  {s.offpeak_discount_pct
                    ? ` · 離峰折 ${s.offpeak_discount_pct}%`
                    : ""}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customer_name">姓名</Label>
        <Input
          id="customer_name"
          required
          value={form.customer_name}
          onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="customer_phone">手機</Label>
        <Input
          id="customer_phone"
          required
          inputMode="tel"
          placeholder="09xxxxxxxx"
          value={form.customer_phone}
          onChange={(e) =>
            setForm((f) => ({ ...f, customer_phone: e.target.value }))
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="starts_local">預約時間</Label>
        <Input
          id="starts_local"
          type="datetime-local"
          required
          value={form.starts_local}
          onChange={(e) =>
            setForm((f) => ({ ...f, starts_local: e.target.value }))
          }
        />
        {selected ? (
          <p className="text-xs text-muted-foreground">
            含防撞緩衝 {selected.buffer_minutes} 分鐘，時段重疊將無法預約。
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="note">備註（選填）</Label>
        <Input
          id="note"
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
        />
      </div>
      <Button type="submit" className="h-11 w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        確認預約（現場付）
      </Button>
    </form>
  );
}
