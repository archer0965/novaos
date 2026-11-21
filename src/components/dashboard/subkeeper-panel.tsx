"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubkeeperLegacyMigrate } from "@/components/dashboard/subkeeper-legacy-migrate";
import {
  monthlyEquivalent,
  PERSONAL_CYCLE_LABELS,
  type PersonalBillingCycle,
  type PersonalSubscription,
} from "@/lib/subkeeper";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CYCLES: PersonalBillingCycle[] = [
  "monthly",
  "yearly",
  "weekly",
  "custom",
];

type FormState = {
  name: string;
  amount_twd: string;
  billing_cycle: PersonalBillingCycle;
  next_billing_on: string;
  reminder_days: string;
  category: string;
  notes: string;
};

const emptyForm: FormState = {
  name: "",
  amount_twd: "",
  billing_cycle: "monthly",
  next_billing_on: "",
  reminder_days: "3",
  category: "",
  notes: "",
};

export function SubkeeperPanel() {
  const [items, setItems] = useState<PersonalSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [setupHint, setSetupHint] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subkeeper/subscriptions");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSetupHint(json.error || "無法載入");
        setItems([]);
        return;
      }
      setSetupHint(null);
      setItems(json.items || []);
    } catch {
      setSetupHint("無法載入訂閱清單");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    // Sync / create NovaOS profile + last_login_at
    void fetch("/api/subkeeper/session", { method: "POST" }).catch(() => null);
  }, []);

  const monthlyTotal = useMemo(
    () =>
      items
        .filter((i) => i.is_active)
        .reduce(
          (sum, i) => sum + monthlyEquivalent(i.amount_twd, i.billing_cycle),
          0
        ),
    [items]
  );

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(form.amount_twd);
    if (!form.name.trim() || !Number.isFinite(amount) || amount < 0) {
      toast.error("請填寫名稱與有效金額");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/subkeeper/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          amount_twd: Math.round(amount),
          billing_cycle: form.billing_cycle,
          next_billing_on: form.next_billing_on || null,
          reminder_days: Number(form.reminder_days) || 3,
          category: form.category.trim() || null,
          notes: form.notes.trim() || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "新增失敗");
      toast.success("已新增訂閱");
      setForm(emptyForm);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "新增失敗");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("確定刪除此訂閱紀錄？")) return;
    try {
      const res = await fetch(
        `/api/subkeeper/subscriptions?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "刪除失敗");
      toast.success("已刪除");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "刪除失敗");
    }
  }

  async function toggleActive(item: PersonalSubscription) {
    try {
      const res = await fetch("/api/subkeeper/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "更新失敗");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "更新失敗");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/80 bg-gradient-to-br from-emerald-50/80 via-background to-sky-50/40 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">📒 訂閱管家</p>
            <h1 className="mt-1 font-display text-2xl font-semibold">
              個人訂閱開銷與扣款提醒
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              已登入拓新雲端 NovaOS
              帳號；訂閱資料依使用者隔離保存在雲端，與其他產品共用同一身分。
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            返回 NovaOS 主站矩陣
          </Link>
        </div>
        <p className="mt-4 font-display text-3xl font-bold text-emerald-900">
          約 NT${monthlyTotal.toLocaleString("zh-TW")}
          <span className="ml-2 text-base font-medium text-muted-foreground">
            ／月（有效訂閱）
          </span>
        </p>
      </section>

      <SubkeeperLegacyMigrate onImported={() => void load()} />

      {setupHint ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {setupHint}
        </p>
      ) : null}

      <form
        onSubmit={onCreate}
        className="space-y-4 rounded-2xl border border-border/80 bg-card/80 p-5"
      >
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <h2 className="font-display text-lg font-semibold">新增訂閱</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sk-name">名稱</Label>
            <Input
              id="sk-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="例如 Netflix、Adobe"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sk-amount">金額（TWD）</Label>
            <Input
              id="sk-amount"
              type="number"
              min={0}
              step={1}
              value={form.amount_twd}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount_twd: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sk-cycle">週期</Label>
            <select
              id="sk-cycle"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.billing_cycle}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  billing_cycle: e.target.value as PersonalBillingCycle,
                }))
              }
            >
              {CYCLES.map((c) => (
                <option key={c} value={c}>
                  {PERSONAL_CYCLE_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sk-next">下次扣款日</Label>
            <Input
              id="sk-next"
              type="date"
              value={form.next_billing_on}
              onChange={(e) =>
                setForm((f) => ({ ...f, next_billing_on: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sk-remind">提前提醒（天）</Label>
            <Input
              id="sk-remind"
              type="number"
              min={0}
              max={30}
              value={form.reminder_days}
              onChange={(e) =>
                setForm((f) => ({ ...f, reminder_days: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sk-cat">分類（選填）</Label>
            <Input
              id="sk-cat"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              placeholder="影音／軟體／雲端…"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sk-notes">備註</Label>
            <Input
              id="sk-notes"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>
        </div>
        <Button type="submit" disabled={saving} className="h-11 gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          新增到我的雲端清單
        </Button>
      </form>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">我的訂閱</h2>
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> 載入中…
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            尚無訂閱紀錄。新增後會保存在你的拓新雲端帳號。
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "rounded-2xl border border-border/80 bg-card/70 p-4",
                  !item.is_active && "opacity-60"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      NT${item.amount_twd.toLocaleString("zh-TW")} ·{" "}
                      {PERSONAL_CYCLE_LABELS[item.billing_cycle]}
                      {item.next_billing_on
                        ? ` · 下次 ${item.next_billing_on}`
                        : ""}
                      {item.category ? ` · ${item.category}` : ""}
                    </p>
                    {item.notes ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(item)}
                    >
                      {item.is_active ? "暫停" : "啟用"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
