"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  AI_DOC_PLAN_META,
  AI_DOC_TIER_CHECKOUT_TOTALS,
  SUBSCRIPTION_BASE_PRICES,
  TIER_CHECKOUT_TOTALS,
  TIER_META,
  type PricingTierId,
  type TierBillingCycle,
} from "@/lib/pricing-tiers";
import { SUBKEEPER_PRODUCT } from "@/lib/subkeeper";
import { PLAN_CATALOG, PRIMARY_PAID_PLAN_KEYS } from "@/types/database";
import { cn } from "@/lib/utils";

const CYCLES: { id: TierBillingCycle; label: string }[] = [
  { id: "monthly", label: "月繳" },
  { id: "half_yearly", label: "半年繳" },
  { id: "yearly", label: "年繳" },
];

const TIERS: PricingTierId[] = ["early_bird", "general"];

/**
 * Homepage pricing: simple comparison first; discount math in a details panel.
 * Hub is the authority for paid modules; 訂閱管家 is explicitly free.
 */
export function PricingMatrix() {
  const [cycle, setCycle] = useState<TierBillingCycle>("monthly");
  const [tier, setTier] = useState<PricingTierId>("early_bird");
  const [showDiscountDetail, setShowDiscountDetail] = useState(false);

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
            方案比較
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
            先看清楚方案差異；折扣與週期細節收在下方說明。{" "}
            <strong className="font-semibold text-emerald-300">
              {SUBKEEPER_PRODUCT.name}永久免費
            </strong>
            ，不需購買全家桶。
          </p>
        </div>

        {/* Simple comparison strip */}
        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">項目</th>
                <th className="px-4 py-3 font-medium">基礎版</th>
                <th className="px-4 py-3 font-medium text-cyan-200">
                  旗艦全家桶
                  <span className="mt-0.5 block text-[11px] font-normal text-cyan-200/80">
                    三模組方案
                  </span>
                </th>
                <th className="px-4 py-3 font-medium text-emerald-200">
                  {SUBKEEPER_PRODUCT.name}
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-t border-white/10">
                <td className="px-4 py-3 text-slate-400">月費（原價）</td>
                <td className="px-4 py-3">NT$299</td>
                <td className="px-4 py-3 text-cyan-100">NT$499</td>
                <td className="px-4 py-3 font-semibold text-emerald-300">免費</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-3 text-slate-400">拓脈預約</td>
                <td className="px-4 py-3">任選 1</td>
                <td className="px-4 py-3">✓</td>
                <td className="px-4 py-3 text-slate-500">—</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-3 text-slate-400">NovaStore</td>
                <td className="px-4 py-3">任選 1</td>
                <td className="px-4 py-3">✓</td>
                <td className="px-4 py-3 text-slate-500">—</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-3 text-slate-400">Nova AI Doc</td>
                <td className="px-4 py-3">另購</td>
                <td className="px-4 py-3">✓ 含商業版額度</td>
                <td className="px-4 py-3 text-slate-500">—</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-3 text-slate-400">
                  訂閱中控
                  <span className="mt-0.5 block text-[11px] text-slate-500">
                    NovaOS 會員中心
                  </span>
                </td>
                <td className="px-4 py-3">✓</td>
                <td className="px-4 py-3">✓</td>
                <td className="px-4 py-3 text-slate-500">—</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-3 text-slate-400">拓維空間</td>
                <td className="px-4 py-3 text-slate-500">獨立 Credit</td>
                <td className="px-4 py-3 text-slate-500">不含（獨立產品）</td>
                <td className="px-4 py-3 text-slate-500">—</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-3 text-slate-400">
                  {SUBKEEPER_PRODUCT.name}
                  <span className="mt-0.5 block text-[11px] text-slate-500">
                    個人訂閱管理工具
                  </span>
                </td>
                <td className="px-4 py-3 text-emerald-300">免費可用</td>
                <td className="px-4 py-3 text-emerald-300">免費可用（不含於方案價）</td>
                <td className="px-4 py-3 text-emerald-300">永久免費</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <p className="font-semibold">
            {SUBKEEPER_PRODUCT.name}＝永久免費個人工具
          </p>
          <p className="mt-1 text-emerald-100/80">
            不需付費方案、不佔全家桶名額。登入後資料雲端保存，可跨裝置同步。
          </p>
          <Link
            href={SUBKEEPER_PRODUCT.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex text-sm font-semibold text-emerald-200 underline-offset-4 hover:underline"
          >
            免費開啟{SUBKEEPER_PRODUCT.name} →
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-4 text-sm text-cyan-50">
          <p className="font-semibold">旗艦全家桶＝三模組方案</p>
          <p className="mt-1 text-xs text-cyan-100/80">
            僅含拓脈預約、NovaStore、Nova AI Doc（加帳號內建訂閱中控）。拓維空間與
            {SUBKEEPER_PRODUCT.name}不在方案價內。
          </p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {[
              "✓ 拓脈預約（完整模組）",
              "✓ NovaStore（訂單無上限）",
              "✓ Nova AI Doc（商業版額度）",
              "✓ 訂閱中控（NovaOS 會員中心）",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                {item}
              </li>
            ))}
          </ul>
          <ul className="mt-3 grid gap-1 text-xs text-cyan-100/75 sm:grid-cols-2">
            <li>不含：拓維空間（獨立 Credit／訂閱）</li>
            <li>
              另提供：{SUBKEEPER_PRODUCT.name}
              （個人訂閱管理工具，永久免費，≠ 訂閱中控）
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() => setShowDiscountDetail((v) => !v)}
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10"
        >
          折扣與週期詳細說明
          <ChevronDown
            className={cn(
              "h-4 w-4 transition",
              showDiscountDetail && "rotate-180"
            )}
          />
        </button>

        {showDiscountDetail ? (
          <div className="mt-4 space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">
              以下為早鳥／一般折扣與週期價；特約店家／推廣大使需人工審核（見{" "}
              <a
                href="#partner"
                className="text-emerald-300 underline-offset-4 hover:underline"
              >
                合作申請
              </a>
              ）。主站價格為權威來源，子站優惠需與此對齊。
            </p>
            <div className="flex flex-wrap gap-2">
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
            <div className="flex flex-wrap gap-2">
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

            <div className="grid gap-5 lg:grid-cols-2">
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
                    <h4 className="font-display text-lg font-semibold text-white">
                      {plan.name}
                    </h4>
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
                      href="/login?next=%2Fdashboard%2Fpass%23upgrade"
                      className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-cyan-400 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      綠界付款升級
                    </Link>
                  </article>
                );
              })}
            </div>

            <h3 className="font-display text-lg font-semibold text-white">
              Nova AI Doc（獨立方案）
            </h3>
            <div className="grid gap-5 md:grid-cols-3">
              {(["free", "pro", "business"] as const).map((key) => {
                const plan = AI_DOC_PLAN_META[key];
                const displayBase =
                  key === "free"
                    ? 0
                    : key === "pro"
                      ? ({ monthly: 199, half_yearly: 1194, yearly: 2388 } as const)[
                          cycle
                        ]
                      : ({ monthly: 499, half_yearly: 2994, yearly: 5988 } as const)[
                          cycle
                        ];
                const price =
                  key === "free"
                    ? 0
                    : AI_DOC_TIER_CHECKOUT_TOTALS[tier][key][cycle];
                return (
                  <article
                    key={key}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <h4 className="font-display font-semibold text-white">
                      {plan.name}
                    </h4>
                    <p className="mt-3 font-display text-2xl font-bold text-white">
                      {key === "free" ? (
                        "免費"
                      ) : (
                        <>
                          {price < displayBase ? (
                            <span className="mr-2 text-sm text-slate-500 line-through">
                              NT${displayBase.toLocaleString("zh-TW")}
                            </span>
                          ) : null}
                          NT${price.toLocaleString("zh-TW")}
                        </>
                      )}
                    </p>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                      {plan.features.map((f) => (
                        <li key={f}>· {f}</li>
                      ))}
                    </ul>
                    {key !== "free" ? (
                      <Link
                        href="/login?next=%2Fdashboard%2Fpass%3Fproduct%3Dai_doc%23upgrade"
                        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-cyan-400/90 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                      >
                        綠界付款升級
                      </Link>
                    ) : null}
                  </article>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              首次付費可套用推薦碼現折 NT$50；月繳可再扣抵推薦點數（上限
              NT$100）。子站顯示之折扣需與本表一致。
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
