"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import {
  AI_DOC_PLAN_META,
  AI_DOC_TIER_CHECKOUT_TOTALS,
  SUBSCRIPTION_BASE_PRICES,
  TIER_CHECKOUT_TOTALS,
  TIER_META,
  type PricingTierId,
  type TierBillingCycle,
} from "@/lib/pricing-tiers";
import { PLAN_CATALOG, PRIMARY_PAID_PLAN_KEYS } from "@/types/database";
import { cn } from "@/lib/utils";

const CYCLES: { id: TierBillingCycle; label: string }[] = [
  { id: "monthly", label: "月繳" },
  { id: "half_yearly", label: "半年繳" },
  { id: "yearly", label: "年繳" },
];

/** Public pricing only shows self-serve tiers; VIP is manual-review. */
const TIERS: PricingTierId[] = ["early_bird", "general"];

export function PricingMatrix() {
  const [cycle, setCycle] = useState<TierBillingCycle>("monthly");
  const [tier, setTier] = useState<PricingTierId>("early_bird");

  const periodLabel = useMemo(() => {
    if (cycle === "yearly") return "年";
    if (cycle === "half_yearly") return "半年";
    return "月";
  }, [cycle]);

  return (
    <section id="pricing" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-cyan-300/90">
            PRICING
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            定價方案
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
            拓脈與 NovaStore 維持原統一方案；Nova AI Doc 採獨立規格，並套用相同早鳥／一般折扣。特約店家／推廣大使需人工審核，請至{" "}
            <a href="#partner" className="text-emerald-300 underline-offset-4 hover:underline">
              合作申請
            </a>
            。
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {TIERS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTier(id)}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-semibold transition sm:text-sm",
                tier === id
                  ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100"
                  : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
              )}
            >
              {TIER_META[id].label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CYCLES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCycle(c.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                cycle === c.id
                  ? "bg-white text-slate-950"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              )}
            >
              {c.label}
              <span className="ml-1 opacity-70">
                ({TIER_META[tier].foldLabels[c.id]})
              </span>
            </button>
          ))}
        </div>

        <h3 className="font-display mt-12 text-xl font-semibold text-white">
          拓脈預約 · NovaStore
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          原統一價格結構不變（基礎版 NT$299／旗艦全家桶 NT$499 起，依週期與資格折扣）
        </p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {PRIMARY_PAID_PLAN_KEYS.map((key) => {
            const plan = PLAN_CATALOG[key];
            const baseKey = key === "unlimited" ? "unlimited" : "starter";
            const base = SUBSCRIPTION_BASE_PRICES[baseKey][cycle];
            const price = TIER_CHECKOUT_TOTALS[tier][baseKey][cycle];
            return (
              <article
                key={key}
                className={cn(
                  "rounded-2xl border p-6",
                  plan.isPopular
                    ? "border-cyan-300/40 bg-gradient-to-br from-cyan-500/15 to-transparent"
                    : "border-white/10 bg-white/[0.03]"
                )}
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-display text-lg font-semibold text-white">
                    {plan.name}
                  </h4>
                  {plan.isPopular ? (
                    <span className="rounded-md bg-cyan-400 px-2 py-0.5 text-[11px] font-semibold text-slate-950">
                      {plan.popularBadge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-400">{plan.blurb}</p>
                <p className="mt-5 font-display text-3xl font-bold text-white">
                  {price < base ? (
                    <span className="mr-2 text-base font-medium text-slate-500 line-through">
                      NT${base.toLocaleString("zh-TW")}
                    </span>
                  ) : null}
                  NT${price.toLocaleString("zh-TW")}
                  <span className="text-sm font-medium text-slate-400">
                    {" "}
                    / {periodLabel}
                  </span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup?next=/dashboard/pass#upgrade"
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-cyan-400 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  綠界付款升級
                </Link>
              </article>
            );
          })}
        </div>

        <h3 className="font-display mt-14 text-xl font-semibold text-white">
          Nova AI Doc（獨立方案）
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          FREE／PRO NT$199／BUSINESS NT$499；公開顯示早鳥／一般價，特約／大使經審核後另開通
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {(["free", "pro", "business"] as const).map((key) => {
            const plan = AI_DOC_PLAN_META[key];
            const displayBase =
              key === "free"
                ? 0
                : key === "pro"
                  ? ({ monthly: 199, half_yearly: 1194, yearly: 2388 } as const)[cycle]
                  : ({ monthly: 499, half_yearly: 2994, yearly: 5988 } as const)[
                      cycle
                    ];
            const price =
              key === "free" ? 0 : AI_DOC_TIER_CHECKOUT_TOTALS[tier][key][cycle];

            return (
              <article
                key={key}
                className={cn(
                  "rounded-2xl border p-6",
                  plan.isPopular
                    ? "border-amber-300/40 bg-gradient-to-br from-amber-400/15 to-transparent"
                    : "border-white/10 bg-white/[0.03]"
                )}
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-display text-lg font-semibold text-white">
                    {plan.name}
                  </h4>
                  {plan.isPopular ? (
                    <span className="rounded-md bg-amber-400 px-2 py-0.5 text-[11px] font-semibold text-slate-950">
                      {plan.popularBadge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-400">{plan.blurb}</p>
                <p className="mt-5 font-display text-3xl font-bold text-white">
                  {key === "free" ? (
                    "免費"
                  ) : (
                    <>
                      {price < displayBase ? (
                        <span className="mr-2 text-base font-medium text-slate-500 line-through">
                          NT${displayBase.toLocaleString("zh-TW")}
                        </span>
                      ) : null}
                      NT${price.toLocaleString("zh-TW")}
                      <span className="text-sm font-medium text-slate-400">
                        {" "}
                        / {periodLabel}
                      </span>
                    </>
                  )}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={
                    key === "free"
                      ? "https://docmate-ai-one.vercel.app/signup"
                      : "/signup?next=/dashboard/pass#upgrade"
                  }
                  className={cn(
                    "mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition",
                    plan.isPopular
                      ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                      : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                  )}
                  {...(key === "free"
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {key === "free" ? "免費體驗" : "綠界付款升級"}
                </Link>
              </article>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          首次付費可套用推薦碼現折 NT$50；月繳可再扣抵推薦點數（上限 NT$100）。
        </p>
      </div>
    </section>
  );
}
