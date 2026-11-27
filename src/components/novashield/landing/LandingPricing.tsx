"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Crown, Lock, Sparkles, Zap } from "lucide-react";

const FREE_ITEMS = [
  "單一總體星等評分 (1-5 星)",
  "Google Maps 好評引導",
  "客訴表單 Email 通知 (Web3Forms/Formspree)",
  "預設主題樣式",
];

const FREE_LOCKED_ITEMS = [
  "LINE 官方帳號 Deep Link 私訊引導（專業版解鎖）",
  "多維度自訂評分與品牌 Logo／主題色（專業版解鎖）",
];

const PRO_ITEMS = [
  { text: "包含免費版所有功能", bold: true },
  {
    text: "多維度自訂評分項目（如餐點品質、服務態度、環境衛生）",
    bold: true,
  },
  {
    text: "LINE 官方帳號 Deep Link 即時私訊引導（一鍵喚起 LINE 對話）",
    bold: true,
  },
  { text: "自訂品牌 Logo 上傳與主題色設定", bold: false },
  { text: "自訂分流星等門檻（如 3 星或 4 星）", bold: false },
];

export function LandingPricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200/80">
          <Sparkles className="h-3.5 w-3.5" />
          <span>純軟體雲端訂閱・免硬體免綁約</span>
        </span>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
          簡單透明的方案定價
        </h2>
        <p className="mt-2.5 text-sm text-slate-600 sm:text-base">
          從免費體驗版開始零成本上線，隨時升級專業版解鎖 LINE 即時客訴攔截與多維度評分。
        </p>

        {/* Billing Toggle */}
        <div className="mt-6 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition sm:text-sm ${
              billing === "monthly"
                ? "bg-[#0F172A] text-white shadow-sm"
                : "text-slate-600 hover:text-[#0F172A]"
            }`}
          >
            月繳方案
          </button>
          <button
            type="button"
            onClick={() => setBilling("yearly")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition sm:text-sm ${
              billing === "yearly"
                ? "bg-[#0F172A] text-white shadow-sm"
                : "text-slate-600 hover:text-[#0F172A]"
            }`}
          >
            <span>年繳方案</span>
            <span className="rounded-full bg-[#F59E0B] px-2 py-0.5 text-[10px] font-extrabold text-white">
              省 $398
            </span>
          </button>
        </div>
      </div>

      {/* 2 Contrasted Pricing Cards */}
      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Free Card */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#0F172A]">
                    免費體驗版
                  </h3>
                  <p className="text-xs font-medium text-slate-500">
                    個人小店入門首選
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-baseline gap-1.5 border-b border-slate-100 pb-6">
              <span className="text-4xl font-black tracking-tight text-[#0F172A]">
                $0
              </span>
              <span className="text-sm font-semibold text-slate-500">
                / 永久免費
              </span>
            </div>

            <ul className="mt-6 space-y-3">
              {FREE_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
              {FREE_LOCKED_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-slate-400"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <Lock className="h-3 w-3" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <Link
              href="/novashield/admin?shop=shop-free"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-[#0F172A] transition hover:border-[#0F172A] hover:bg-slate-50"
            >
              <span>免費開始使用</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Pro Card (Recommended) */}
        <div className="relative flex flex-col justify-between rounded-3xl border-2 border-[#F59E0B] bg-[#0F172A] p-7 text-white shadow-xl">
          {/* Recommended Badge */}
          <div className="absolute -top-3.5 right-6 inline-flex items-center gap-1 rounded-full bg-[#F59E0B] px-3.5 py-1 text-xs font-extrabold tracking-wide text-white shadow-md">
            <Crown className="h-3.5 w-3.5" />
            <span>Recommended 熱門推薦</span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B] text-white shadow-sm">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">專業版 Pro</h3>
                  <p className="text-xs font-medium text-amber-200/80">
                    餐飲、美業與連鎖門市必備
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-b border-white/10 pb-6">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black tracking-tight text-white">
                  {billing === "monthly" ? "$199" : "$1,990"}
                </span>
                <span className="text-sm font-semibold text-slate-300">
                  {billing === "monthly" ? "/ 月" : "/ 年"}
                </span>
              </div>
              <p className="mt-1 text-xs text-amber-300">
                {billing === "monthly"
                  ? "或選擇年繳 $1,990 / 年（平均每月只要 $166）"
                  : "原價 $2,388 / 年，年繳現省 $398（相當於買 10 送 2）"}
              </p>
            </div>

            <ul className="mt-6 space-y-3">
              {PRO_ITEMS.map((item) => (
                <li
                  key={item.text}
                  className="flex items-start gap-2.5 text-sm text-slate-100"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F59E0B]/20 text-[#F59E0B]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className={item.bold ? "font-bold text-white" : "text-slate-200"}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <Link
              href="/novashield/admin?shop=shop123#upgrade"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F59E0B] px-5 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-amber-400 active:scale-[0.99]"
            >
              <span>立即升級專業版（綠界付款）</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-2.5 text-center text-[11px] text-slate-400">
              付款成功自動開通・到期前 3 天自動寄送 Email 續費提醒
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
