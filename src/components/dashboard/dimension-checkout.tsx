"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DIMENSION_PAID_PLANS,
  DIMENSION_SITE_URL,
  isDimensionPaidPlanId,
  type DimensionPaidPlanId,
} from "@/lib/dimension-billing";

async function submitHtmlCheckout(
  body: Record<string, unknown>
) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || "無法建立拓維付款訂單");
  }
  if (!contentType.includes("text/html")) {
    throw new Error("付款回應格式錯誤");
  }
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const srcForm = doc.querySelector("form");
  if (!srcForm?.action) throw new Error("綠界付款表單無效");
  const form = document.createElement("form");
  form.method = "post";
  form.action = srcForm.action;
  form.acceptCharset = "UTF-8";
  form.style.display = "none";
  srcForm.querySelectorAll("input").forEach((input) => {
    const field = document.createElement("input");
    field.type = "hidden";
    field.name = input.name;
    field.value = input.value;
    form.appendChild(field);
  });
  document.body.appendChild(form);
  form.submit();
}

/**
 * 拓維空間付費：主站綠界 → callback → /api/credits/fulfill。
 * 支援 URL ?plan=single|monthly|halfyear|yearly（自產品站導回）。
 */
export function DimensionCheckout({
  initialPlan,
}: {
  initialPlan?: string | null;
}) {
  const [loading, setLoading] = useState<DimensionPaidPlanId | null>(null);
  const highlight = isDimensionPaidPlanId(initialPlan) ? initialPlan : null;

  useEffect(() => {
    if (!highlight) return;
    const el = document.getElementById("dimension-upgrade");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [highlight]);

  async function checkout(planId: DimensionPaidPlanId) {
    setLoading(planId);
    try {
      await submitHtmlCheckout({
        catalog: "dimension",
        plan: planId,
        module: "dimension",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "拓維付款失敗");
      setLoading(null);
    }
  }

  return (
    <section
      id="dimension-upgrade"
      className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/70 via-background to-slate-50 p-5 md:p-6"
    >
      <p className="text-sm text-muted-foreground">拓維空間 · 獨立 Credit／訂閱</p>
      <h2 className="mt-1 font-display text-xl font-semibold">
        擬真預覽付費方案
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        不包含在旗艦全家桶。付款成功後由主站回調授權產品站入帳；前端
        <code className="mx-1 rounded bg-muted px-1">?paid=1</code>
        不會加點。
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(DIMENSION_PAID_PLANS) as DimensionPaidPlanId[]).map(
          (id) => {
            const plan = DIMENSION_PAID_PLANS[id];
            return (
              <div
                key={id}
                className={`rounded-xl border p-4 ${
                  highlight === id
                    ? "border-violet-400 bg-violet-50 ring-2 ring-violet-200"
                    : "border-border/70 bg-card/80"
                }`}
              >
                <p className="font-semibold">{plan.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{plan.blurb}</p>
                <p className="mt-3 font-display text-2xl font-bold">
                  NT${plan.amount}
                </p>
                <Button
                  type="button"
                  className="mt-3 h-10 w-full"
                  disabled={loading !== null}
                  onClick={() => checkout(id)}
                >
                  {loading === id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  綠界付款
                </Button>
              </div>
            );
          }
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        產品站：{" "}
        <a
          href={DIMENSION_SITE_URL}
          className="underline underline-offset-2 hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          {DIMENSION_SITE_URL.replace(/^https:\/\//, "")}
        </a>
      </p>
    </section>
  );
}
