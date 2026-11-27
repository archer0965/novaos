"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Crown,
  Lock,
  MessageSquare,
  Phone,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { ProUpgradeCard } from "./ProUpgradeCard";
import {
  loadShopAnalytics,
  toggleFeedbackItemStatus,
} from "@/lib/novashield/analytics";
import type {
  FeedbackStatus,
  ShopAnalyticsSummary,
  ShopConfig,
} from "@/lib/novashield/types";

interface AnalyticsDashboardProps {
  config: ShopConfig;
  onUpgradeToPro: () => void;
  onAnalyzeFeedback?: (text: string) => void;
}

const STAR_BAR_STYLE: Record<
  5 | 4 | 3 | 2 | 1,
  { bar: string; badge: string; label: string }
> = {
  5: { bar: "bg-emerald-500", badge: "text-emerald-700", label: "5 星好評" },
  4: { bar: "bg-[#F59E0B]", badge: "text-amber-700", label: "4 星好評" },
  3: { bar: "bg-orange-400", badge: "text-orange-700", label: "3 星普通" },
  2: { bar: "bg-rose-400", badge: "text-rose-700", label: "2 星負評" },
  1: { bar: "bg-rose-600", badge: "text-rose-800", label: "1 星負評" },
};

function formatTaipeiShort(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function AnalyticsDashboard({
  config,
  onUpgradeToPro,
  onAnalyzeFeedback,
}: AnalyticsDashboardProps) {
  const [summary, setSummary] = useState<ShopAnalyticsSummary>(() =>
    loadShopAnalytics(config),
  );

  useEffect(() => {
    setSummary(loadShopAnalytics(config));
  }, [config]);

  const isPro = config.plan === "PRO";

  function handleToggleStatus(id: string, current: FeedbackStatus) {
    const next: FeedbackStatus = current === "messaged" ? "pending" : "messaged";
    toggleFeedbackItemStatus(id, next);
    setSummary(loadShopAnalytics(config));
  }

  return (
    <div className="space-y-6">
      {/* 1. Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Reviews */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              累積回饋總數
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[#0F172A]">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-[#0F172A]">
              {summary.totalCount.toLocaleString("zh-TW")}
            </span>
            <span className="text-xs font-semibold text-slate-500">筆</span>
          </div>
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <TrendingUp className="h-3 w-3" />
            <span>含模擬基準與即時收集數據</span>
          </p>
        </div>

        {/* Average Star */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              平均星等得分
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-[#F59E0B]">
              <Star className="h-4 w-4 fill-[#F59E0B]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black tracking-tight text-[#0F172A]">
              {summary.averageRating.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
          </div>
          <div className="mt-2 flex items-center gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3.5 w-3.5 ${
                  star <= Math.round(summary.averageRating)
                    ? "fill-[#F59E0B] text-[#F59E0B]"
                    : "fill-transparent text-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Google Maps Redirects */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              好評導流至 Google 數
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-[#0F172A]">
              {summary.googleRedirectCount.toLocaleString("zh-TW")}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              筆（4–5 星）
            </span>
          </div>
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800">
            導流率 {summary.googleRedirectRate.toFixed(1)}%
          </p>
        </div>

        {/* LINE Intercepted Complaints */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              LINE 私訊客訴攔截數
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#06C755]/15 text-[#06C755]">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-[#0F172A]">
              {summary.interceptedCount.toLocaleString("zh-TW")}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              筆（1–3 星）
            </span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-slate-500">
            {isPro
              ? "已啟用 LINE Deep Link 私訊即時化解"
              : "免費版目前採 Email 客訴表單通知"}
          </p>
        </div>
      </div>

      {/* 2. Star Distribution + Pro Multi-Dimension Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Star Distribution Bar Chart */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                好評 vs 負評星等分佈
              </h2>
              <p className="text-xs text-slate-500">
                4–5 星自動導流 Google Maps，1–3 星轉入私下客訴管道
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                好評導流
              </span>
              <span className="inline-flex items-center gap-1 text-rose-700">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                私訊攔截
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {summary.starDistribution.map((bucket) => {
              const style = STAR_BAR_STYLE[bucket.star];
              return (
                <div
                  key={bucket.star}
                  className="grid grid-cols-12 items-center gap-2 text-xs sm:gap-3"
                >
                  <div className="col-span-3 flex items-center gap-1 sm:col-span-2">
                    <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    <span className="font-bold text-slate-800">
                      {bucket.star} 星
                    </span>
                  </div>

                  <div className="col-span-6 h-3 overflow-hidden rounded-full bg-slate-100 sm:col-span-7">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                      style={{ width: `${Math.max(bucket.percent, 2)}%` }}
                    />
                  </div>

                  <div className="col-span-3 flex items-center justify-end gap-1.5 text-right">
                    <span className={`font-bold ${style.badge}`}>
                      {bucket.count} 筆
                    </span>
                    <span className="hidden text-[11px] text-slate-400 sm:inline">
                      ({bucket.percent.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pro Multi-Dimension Satisfaction Analysis */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                多維度滿意度分析
              </h2>
              <p className="text-xs text-slate-500">
                掌握各服務面向的強弱項，精準優化門市營運
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                isPro
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {isPro ? (
                <>
                  <Crown className="h-3 w-3" />
                  專業版已解鎖
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  專業版功能
                </>
              )}
            </span>
          </div>

          {!isPro && (
            <div className="mb-4">
              <ProUpgradeCard
                onUpgrade={onUpgradeToPro}
                detail="升級專業版即可解鎖餐點、服務、環境等多維度滿意度報表分析。"
              />
            </div>
          )}

          <div
            className={`space-y-3.5 ${
              !isPro ? "pointer-events-none select-none opacity-45 blur-[1px]" : ""
            }`}
            aria-disabled={!isPro}
          >
            {summary.categoryAverages.map((cat) => {
              const pct = Math.min(100, Math.max(0, (cat.average / 5) * 100));
              const isHigh = cat.average >= 4.5;
              return (
                <div key={cat.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{cat.label}</span>
                    <span className="inline-flex items-center gap-1 font-extrabold text-[#0F172A]">
                      <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      {cat.average.toFixed(1)}
                      <span className="font-normal text-slate-400">/ 5.0</span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? "bg-emerald-500" : "bg-[#F59E0B]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* 3. Recent Feedbacks Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              近期顧客意見列表
            </h2>
            <p className="text-xs text-slate-500">
              顯示最新 {summary.recentFeedbacks.length} 筆顧客評分與客訴紀錄，點擊狀態按鈕可切換處理進度
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
            最新 {summary.recentFeedbacks.length} 筆
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500">
                <th className="px-5 py-3">時間（台北）</th>
                <th className="px-4 py-3">星等</th>
                <th className="px-4 py-3">客訴／意見內容摘要</th>
                <th className="px-4 py-3">顧客聯絡資訊</th>
                <th className="px-5 py-3 text-right">處理狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.recentFeedbacks.map((item) => {
                const isLow = item.rating <= 3;
                const isMessaged = item.status === "messaged";
                return (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {formatTaipeiShort(item.createdAt)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${
                          isLow
                            ? "bg-rose-50 text-rose-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                        {item.rating} 星
                      </span>
                    </td>
                    <td className="max-w-md px-4 py-3.5 leading-relaxed text-slate-700">
                      <p className="line-clamp-2">{item.summary}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-800">
                          {item.customerName || "匿名顧客"}
                        </p>
                        {item.phone ? (
                          <p className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {item.phone}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400">未留電話</p>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {isLow && onAnalyzeFeedback && (
                          <button
                            type="button"
                            onClick={() => onAnalyzeFeedback(item.summary)}
                            className="inline-flex items-center gap-1 rounded-full bg-[#0F172A] px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-slate-800"
                          >
                            <Sparkles className="h-3 w-3 text-[#F59E0B]" />
                            <span>AI 分析</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id, item.status)}
                          title="點擊切換處理狀態"
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                            isMessaged
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {isMessaged ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>已私訊</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" />
                              <span>未處理</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
