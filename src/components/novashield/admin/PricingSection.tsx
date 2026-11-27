"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CreditCard, Crown, Sparkles, X, Zap } from "lucide-react";
import type { BillingCycle, PlanTier } from "@/lib/novashield/types";

interface PricingSectionProps {
  activePlan?: PlanTier;
  onUpgradeClick?: (cycle: BillingCycle) => void;
  compact?: boolean;
}

const FREE_INCLUDED = [
  "單一總體星等評分（預設 4 星以上跳轉 Google 商家）",
  "1–3 星客訴表單發送 Email 通知（支援 Web3Forms / Formspree）",
  "專屬門市評分網址與 QR Code 圖片下載",
  "頁底合規連結「點此直接前往 Google Maps 發表公開評論」",
];

const FREE_EXCLUDED = [
  "不包含 LINE 官方帳號跳轉、客訴管理中心與多門市管理",
  "不包含多維度自訂評分與品牌 Logo／主題色客製化",
];

const PRO_FEATURES = [
  "解鎖客訴管理中心（未處理／處理中／已解決狀態與店長處理備忘歷程）",
  "解鎖多門市管理系統（單一主帳號管理多家分店與跨店績效比較表）",
  "解鎖 LINE 官方帳號 Deep Link 私訊引導（3 星以下一鍵開啟 LINE 對話）",
  "解鎖多維度自訂評分、自訂 Logo／主題色與每月 20 次 AI 客訴分析",
  "到期前 3 天自動寄送 Email 繳費提醒，透過綠界 ECPay 安全續費",
];

export function PricingSection({
  activePlan,
  onUpgradeClick,
  compact = false,
}: PricingSectionProps) {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  return (
    <section
      id="upgrade"
      className={`scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white shadow-sm ${
        compact ? "p-5" : "p-6 sm:p-8"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            <Sparkles className="h-3.5 w-3.5" />
            綠界 ECPay 安全收款・付款成功立即自動開通
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            免費版與專業版功能權限比較
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            免費版支援基礎單一星等與 Email 通知；付費升級專業版即解鎖 LINE 即時私訊、多維度評分與品牌客製化。
          </p>
        </div>

        <div className="inline-flex self-start rounded-xl bg-slate-100 p-1 sm:self-auto">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              billing === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            月繳方案
          </button>
          <button
            type="button"
            onClick={() => setBilling("yearly")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              billing === "yearly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>年繳方案</span>
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
              省 $398
            </span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* FREE Plan */}
        <div
          className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
            activePlan === "FREE"
              ? "border-slate-900 bg-slate-50/70 ring-1 ring-slate-900/10"
              : "border-slate-200 bg-white"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Zap className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">免費版 FREE</h3>
              </div>
              {activePlan === "FREE" && (
                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  目前方案
                </span>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                $0
              </span>
              <span className="text-sm font-medium text-slate-500">
                / 月（永久免費）
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              適合個人小店快速建立基礎星等評分與 Email 客訴通知表單。
            </p>

            <ul className="mt-5 space-y-2.5">
              {FREE_INCLUDED.map((feat) => (
                <li
                  key={feat}
                  className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 sm:text-sm"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <span>{feat}</span>
                </li>
              ))}
              {FREE_EXCLUDED.map((feat) => (
                <li
                  key={feat}
                  className="flex items-start gap-2 text-xs leading-relaxed text-slate-400 sm:text-sm"
                >
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            {activePlan ? (
              <div className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-center text-xs font-bold text-slate-600">
                {activePlan === "FREE"
                  ? "目前使用中（付費功能已鎖定）"
                  : "已升級為專業版"}
              </div>
            ) : (
              <Link
                href="/novashield/admin?shop=shop-free"
                className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              >
                免費開始使用
              </Link>
            )}
          </div>
        </div>

        {/* PRO Plan */}
        <div
          className={`relative flex flex-col justify-between rounded-2xl border p-5 transition ${
            activePlan === "PRO"
              ? "border-amber-500 bg-gradient-to-b from-amber-50/60 to-white ring-1 ring-amber-500/30"
              : "border-amber-300 bg-gradient-to-b from-amber-50/40 to-white"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
                  <Crown className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">專業版 PRO</h3>
              </div>
              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                {activePlan === "PRO" ? "已付費開通" : "門市首選"}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-1.5">
              {billing === "monthly" ? (
                <>
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    $199
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    / 月（或年繳 $1,990/年）
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    $1,990
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    / 年（平均 $166/月）
                  </span>
                </>
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-600">
              透過綠界 ECPay 付款完成後立即解鎖全功能，到期前 3 天自動寄信提醒續費。
            </p>

            <ul className="mt-5 space-y-2.5">
              {PRO_FEATURES.map((feat) => (
                <li
                  key={feat}
                  className="flex items-start gap-2 text-xs leading-relaxed text-slate-800 sm:text-sm"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            {onUpgradeClick ? (
              <button
                type="button"
                onClick={() => onUpgradeClick(billing)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
              >
                <CreditCard className="h-4 w-4 text-[#F59E0B]" />
                <span>
                  {activePlan === "PRO"
                    ? `透過綠界提前續費（${billing === "yearly" ? "$1,990/年" : "$199/月"}）`
                    : `透過綠界付費升級（${billing === "yearly" ? "$1,990/年" : "$199/月"}）`}
                </span>
              </button>
            ) : (
              <Link
                href="/novashield/admin?shop=shop123#upgrade"
                className="block w-full rounded-xl bg-amber-500 px-4 py-2.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
              >
                前往綠界付費升級
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
