"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  SUBSCRIPTION_BASE_PRICES,
  TIER_CHECKOUT_TOTALS,
  TIER_META,
  type PricingTierId,
  type TierBillingCycle,
} from "@/lib/pricing-tiers";
import { SUBKEEPER_PRODUCT } from "@/lib/subkeeper";
import { CHECKOUT_PLAN_CATALOG, CHECKOUT_PLAN_ORDER } from "@/types/database";
import { cn } from "@/lib/utils";

const CYCLES: { id: TierBillingCycle; label: string }[] = [
  { id: "monthly", label: "月繳" },
  { id: "half_yearly", label: "半年繳" },
  { id: "yearly", label: "年繳" },
];

const TIERS: PricingTierId[] = ["early_bird", "general"];

/**
 * Homepage pricing: clear 4-tier comparison + free 訂閱管家; discount math in details panel.
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
            單模組、加購 Nova商譽寶組合、雙模組旗艦與三合一旗艦全家桶一次看清楚。{" "}
            <strong className="font-semibold text-emerald-300">
              {SUBKEEPER_PRODUCT.name}永久免費
            </strong>
            ，不需購買全家桶。
          </p>
        </div>

        {/* Comparison table */}
        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">項目</th>
                <th className="px-4 py-3 font-medium">基礎版</th>
                <th className="px-4 py-3 font-medium text-amber-200">
                  基礎＋商譽寶
                  <span className="mt-0.5 block text-[11px] font-normal text-amber-200/80">
                    單模組＋商譽寶 PRO
                  </span>
                </th>
                <th className="px-4 py-3 font-medium text-sky-200">
                  雙模組旗艦
                  <span className="mt-0.5 block text-[11px] font-normal text-sky-200/80">
                    拓脈＋NovaStore
                  </span>
                </th>
                <th className="px-4 py-3 font-medium text-cyan-200">
                  旗艦全家桶
                  <span className="mt-0.5 block text-[11px] font-normal text-cyan-200/80">
                    三合一（含商譽寶 PRO）
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
                <td className="px-4 py-3 font-semibold text-amber-100">NT$399</td>
                <td className="px-4 py-3 text-sky-100">NT$499</td>
                <td className="px-4 py-3 font-semibold text-cyan-100">NT$599</td>
                <td className="px-4 py-3 font-semibold text-emerald-300">免費</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-3 text-slate-400">拓脈預約</td>
                <td className="px-4 py-3">任選 1</td>
                <td className="px-4 py-3">任選 1</td>
                <td className="px-4 py-3">✓</td>
                <td className="px-4 py-3">✓</td>
                <td className="px-4 py-3 text-slate-500">—</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-3 text-slate-400">NovaStore</td>
                <td className="px-4 py-3">任選 1</td>
                <td className="px-4 py-3">任選 1</td>
                <td className="px-4 py-3">✓</td>
                <td className="px-4 py-3">✓</td>
                <td className="px-4 py-3 text-slate-500">—</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-3 text-slate-400">Nova商譽寶 PRO</td>
                <td className="px-4 py-3 text-slate-500">另購 $199/月</td>
                <td className="px-4 py-3 font-semibold text-amber-200">✓ 內含 PRO</td>
                <td className="px-4 py-3 text-slate-500">另購 $199/月</td>
                <td className="px-4 py-3 font-semibold text-cyan-200">✓ 內含 PRO</td>
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
                <td className="px-4 py-3">✓</td>
                <td className="px-4 py-3">✓</td>
                <td className="px-4 py-3 text-slate-500">—</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-3 text-slate-400">拓維空間</td>
                <td className="px-4 py-3 text-slate-500">獨立 Credit</td>
                <td className="px-4 py-3 text-slate-500">不含（獨立產品）</td>
                <td className="px-4 py-3 text-slate-500">不含（獨立產品）</td>
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
                <td className="px-4 py-3 text-emerald-300">免費可用</td>
                <td className="px-4 py-3 text-emerald-300">免費可用</td>
                <td className="px-4 py-3 text-emerald-300">免費可用</td>
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
          <p className="font-semibold">
            旗艦全家桶系列（NT$399／NT$499／NT$599）
          </p>
          <p className="mt-1 text-xs text-cyan-100/80">
            依門市需求自由搭配：單模組＋Nova商譽寶 PRO（$399/月）、拓脈＋NovaStore（$499/月），或三合一全家桶 拓脈＋NovaStore＋Nova商譽寶 PRO（$599/月）。拓維空間為獨立 Credit 產品，不在方案價內。
          </p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {[
              "✓ 拓脈預約或 NovaStore ＋ 商譽寶 PRO：NT$399／月",
              "✓ 拓脈預約 ＋ NovaStore（雙模組旗艦）：NT$499／月",
              "✓ 拓脈預約 ＋ NovaStore ＋ 商譽寶 PRO：NT$599／月",
              "✓ 付款成功自動同步開通 Nova商譽寶 PRO",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Link
              href="/login?next=%2Fdashboard%2Fpass%23upgrade"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              前往訂閱中控選擇方案 →
            </Link>
          </div>
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
              以下為早鳥／一般折扣與週期價；特約店家需人工審核（見{" "}
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
              {CHECKOUT_PLAN_ORDER.map((key) => {
                const plan = CHECKOUT_PLAN_CATALOG[key];
                const base = SUBSCRIPTION_BASE_PRICES[key][cycle];
                const price = TIER_CHECKOUT_TOTALS[tier][key][cycle];
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
                      {plan.popularBadge ? (
                        <span className="rounded-md bg-cyan-400/20 px-2 py-0.5 text-xs font-semibold text-cyan-200">
                          {plan.popularBadge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{plan.blurb}</p>
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
