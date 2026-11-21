"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateBookingServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    duration_minutes: "60",
    price: "0",
    offpeak_discount_pct: "0",
    buffer_minutes: "10",
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/booking/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          duration_minutes: Number(form.duration_minutes),
          price: Number(form.price),
          offpeak_discount_pct: Number(form.offpeak_discount_pct),
          buffer_minutes: Number(form.buffer_minutes),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "建立失敗");
      toast.success("服務已建立");
      router.push("/dashboard/booking");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "建立失敗");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold">新增預約服務</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          設定時長、價格、離峰折扣與防撞緩衝（分鐘）。若尚未啟用拓脈預約，API 將拒絕寫入。
        </p>
      </div>
      {(
        [
          ["title", "服務名稱", "例如：剪髮造型"],
          ["duration_minutes", "時長（分鐘）", "60"],
          ["price", "價格 NT$", "800"],
          ["offpeak_discount_pct", "離峰折扣 %", "10"],
          ["buffer_minutes", "防撞緩衝（分鐘）", "10"],
        ] as const
      ).map(([key, label, placeholder]) => (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={key}>{label}</Label>
          <Input
            id={key}
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder}
            required={key === "title"}
          />
        </div>
      ))}
      <Button type="submit" className="h-11 w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        儲存服務
      </Button>
    </form>
  );
}
