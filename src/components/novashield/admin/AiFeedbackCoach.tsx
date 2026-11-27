"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardList,
  Copy,
  Crown,
  Loader2,
  Lock,
  MessageCircle,
  Sparkles,
  Tag,
} from "lucide-react";
import { ProUpgradeCard } from "./ProUpgradeCard";
import type {
  AiAnalyzeApiResponse,
  AiFeedbackAnalysis,
  AiSeverity,
} from "@/lib/novashield/aiAnalyzer";
import type { ShopConfig } from "@/lib/novashield/types";

interface AiFeedbackCoachProps {
  config: ShopConfig;
  initialText?: string;
  onUpgradeToPro: () => void;
}

const FREE_MONTHLY_LIMIT = 3;
const QUOTA_STORAGE_PREFIX = "novaos:novashield:ai-quota:v1";

const SAMPLE_COMPLAINTS = [
  {
    label: "等很久餐點還冷掉",
    text: "週末中午來用餐，點完餐等了快 35 分鐘才上菜，結果義大利麵端上來已經溫溫冷冷的，提醒店員也沒什麼表示，體驗非常差。",
  },
  {
    label: "服務生態度很跩",
    text: "詢問招牌飲品能不能去冰時，櫃檯服務生態度很跩、口氣超不耐煩，好像欠他錢一樣，餐點再好吃也不想再來了。",
  },
  {
    label: "桌面黏黏的還有異味",
    text: "剛入座就發現桌子沒擦乾淨、摸起來黏黏的，角落還有前一位客人的紙屑與淡淡異味，希望加強環境清潔。",
  },
  {
    label: "結帳算錯還推託",
    text: "結帳時多算了一份加點甜點，回去核對明細時收銀人員還推託說是系統問題，等了好久才處理完。",
  },
];

function getTaipeiMonthKey(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value || "2026";
  const m = parts.find((p) => p.type === "month")?.value || "01";
  return `${y}-${m}`;
}

function readMonthlyUsedCount(shopId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const key = `${QUOTA_STORAGE_PREFIX}:${shopId}:${getTaipeiMonthKey()}`;
    const raw = window.localStorage.getItem(key);
    const num = Number(raw || "0");
    return Number.isFinite(num) && num >= 0 ? Math.floor(num) : 0;
  } catch {
    return 0;
  }
}

function incrementMonthlyUsedCount(shopId: string): number {
  const next = readMonthlyUsedCount(shopId) + 1;
  if (typeof window !== "undefined") {
    try {
      const key = `${QUOTA_STORAGE_PREFIX}:${shopId}:${getTaipeiMonthKey()}`;
      window.localStorage.setItem(key, String(next));
    } catch {
      // ignore storage errors
    }
  }
  return next;
}

const SEVERITY_STYLE: Record<
  AiSeverity,
  { label: string; className: string }
> = {
  高: {
    label: "高危險・建議立即處理",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  中: {
    label: "中度・建議當日安撫",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  低: {
    label: "輕微・記錄持續優化",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

export function AiFeedbackCoach({
  config,
  initialText = "",
  onUpgradeToPro,
}: AiFeedbackCoachProps) {
  const [feedbackText, setFeedbackText] = useState(initialText);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AiFeedbackAnalysis | null>(null);
  const [analysisMode, setAnalysisMode] = useState<"openai" | "mock" | null>(
    null,
  );
  const [copiedReply, setCopiedReply] = useState(false);
  const [usedThisMonth, setUsedThisMonth] = useState(0);

  const isPro = config.plan === "PRO";
  const remainingFree = Math.max(0, FREE_MONTHLY_LIMIT - usedThisMonth);
  const freeQuotaExhausted = !isPro && remainingFree <= 0;

  useEffect(() => {
    setUsedThisMonth(readMonthlyUsedCount(config.shopId));
  }, [config.shopId]);

  useEffect(() => {
    if (initialText) {
      setFeedbackText(initialText);
      setErrorMessage(null);
    }
  }, [initialText]);

  async function handleAnalyze() {
    const trimmed = feedbackText.trim();
    if (!trimmed) {
      setErrorMessage("請先貼上顧客負評或點擊上方範例文字。");
      return;
    }

    if (freeQuotaExhausted) {
      setErrorMessage(
        "免費版本月 3 次 AI 智能分析體驗已用畢，請升級專業版解鎖無限制使用。",
      );
      return;
    }

    setAnalyzing(true);
    setErrorMessage(null);
    setCopiedReply(false);

    try {
      const response = await fetch("/api/ai/analyze-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackText: trimmed,
          shopName: config.shopName,
        }),
      });

      const data = (await response.json()) as AiAnalyzeApiResponse;
      if (!response.ok || !data.ok || !data.result) {
        setErrorMessage(data.error || "AI 分析失敗，請稍後再試。");
        return;
      }

      setAnalysis(data.result);
      setAnalysisMode(data.mode);

      if (!isPro) {
        const nextUsed = incrementMonthlyUsedCount(config.shopId);
        setUsedThisMonth(nextUsed);
      }
    } catch {
      setErrorMessage("無法連線至 AI 分析服務，請稍後再試。");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleCopyReply() {
    if (!analysis?.lineReply) return;
    try {
      await navigator.clipboard.writeText(analysis.lineReply);
      setCopiedReply(true);
      setTimeout(() => setCopiedReply(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Input Card */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F172A] text-[#F59E0B] shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                  AI 客訴分析與回覆建議大師
                </h2>
                {isPro && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0F172A] px-2.5 py-0.5 text-[11px] font-bold text-[#F59E0B] shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    NovaOS AI Powered
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                貼上顧客負評或客訴原文，AI 即時判斷問題歸因與風險等級，產出高情商 LINE 挽回話術與店內 SOP 改善對策
              </p>
            </div>
          </div>

          {isPro ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200/80">
              <Crown className="h-3.5 w-3.5 text-[#F59E0B]" />
              <span>專業版：無限制次數</span>
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                freeQuotaExhausted
                  ? "bg-rose-50 text-rose-700 ring-rose-200"
                  : "bg-slate-100 text-slate-700 ring-slate-200"
              }`}
            >
              {freeQuotaExhausted && <Lock className="h-3 w-3" />}
              <span>
                免費版體驗：本月剩餘 {remainingFree} / {FREE_MONTHLY_LIMIT} 次
              </span>
            </span>
          )}
        </div>

        {/* Free quota exhausted gate */}
        {freeQuotaExhausted && (
          <div className="mb-5">
            <ProUpgradeCard
              onUpgrade={onUpgradeToPro}
              detail="免費版每月提供 3 次 AI 客訴分析體驗。升級專業版即可解鎖「NovaOS AI Powered」無限次客訴分析、高階談判話術與完整內部 SOP 改善建議。"
            />
          </div>
        )}

        {/* Quick Sample Buttons */}
        <div className="mb-3">
          <span className="mb-2 block text-xs font-semibold text-slate-500">
            快速貼上常見客訴範例：
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_COMPLAINTS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setFeedbackText(sample.text);
                  setErrorMessage(null);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50/70 hover:text-amber-900"
              >
                「{sample.label}」
              </button>
            ))}
          </div>
        </div>

        {/* Complaint Textarea */}
        <div>
          <label
            htmlFor="ai-complaint-input"
            className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700"
          >
            <span>顧客負評 / 客訴原文</span>
            <span className="font-normal text-slate-400">
              {feedbackText.length} / 1500
            </span>
          </label>
          <textarea
            id="ai-complaint-input"
            rows={4}
            maxLength={1500}
            value={feedbackText}
            onChange={(e) => {
              setFeedbackText(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="請貼上 Google 評論或顧客私訊的負評內容，例如：週末等了 30 分鐘餐點上來已經冷掉..."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          />
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Row */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            {isPro
              ? "專業版尊享高階安撫談判話術與完整內部營運檢討清單。"
              : "免費版可體驗基礎歸因與回覆建議；升級專業版享無限次數與 NovaOS AI Powered 進階話術。"}
          </p>

          <button
            type="button"
            disabled={analyzing || freeQuotaExhausted}
            onClick={() => void handleAnalyze()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#F59E0B]" />
                <span>AI 正在深度分析客訴中...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-[#F59E0B]" />
                <span>一鍵 AI 智能分析與產生建議話術</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* AI Response Card */}
      {analysis && (
        <section className="overflow-hidden rounded-2xl border border-amber-200/90 bg-white shadow-md">
          {/* Card Header with Category & Severity Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-[#0F172A] to-slate-800 px-5 py-4 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#F59E0B]" />
              <h3 className="text-sm font-extrabold sm:text-base">
                AI 智能診斷與挽回方案
              </h3>
              {isPro && (
                <span className="rounded-full bg-[#F59E0B]/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-400/30">
                  NovaOS AI Powered
                </span>
              )}
            </div>

            <span className="text-[11px] text-slate-300">
              {analysisMode === "openai"
                ? "LLM 即時推論引擎"
                : "NovaOS 門市營運專家模型"}
            </span>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            {/* Classification & Severity Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800">
                <Tag className="h-3.5 w-3.5 text-amber-600" />
                <span>問題歸因：</span>
                <span className="rounded-md bg-[#0F172A] px-2 py-0.5 text-white">
                  {analysis.category}
                </span>
              </div>

              <div
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold ${SEVERITY_STYLE[analysis.severity].className}`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>嚴重度：{SEVERITY_STYLE[analysis.severity].label}</span>
              </div>
            </div>

            {/* LINE Copyable Reply Box */}
            <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-[#8CABD9]/20">
              <div className="flex items-center justify-between bg-[#06C755] px-4 py-2.5 text-white">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                  <MessageCircle className="h-4 w-4 fill-white/25" />
                  <span>LINE 一對一私訊建議回覆話術</span>
                </span>

                <button
                  type="button"
                  onClick={() => void handleCopyReply()}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/95 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-white"
                >
                  {copiedReply ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>已複製話術</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>一鍵複製</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4">
                <div className="rounded-2xl rounded-tl-sm bg-white p-4 text-sm leading-relaxed text-slate-800 shadow-sm">
                  {analysis.lineReply}
                </div>
              </div>
            </div>

            {/* Internal SOP Advice */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h4 className="inline-flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
                  <ClipboardList className="h-4 w-4 text-amber-600" />
                  <span>店內營運改善建議（Internal Action SOP）</span>
                </h4>
                {!isPro && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    <Lock className="h-3 w-3" />
                    免費版顯示基礎建議
                  </span>
                )}
              </div>

              <ol className="space-y-2.5">
                {(isPro
                  ? analysis.internalAdvice
                  : analysis.internalAdvice.slice(0, 2)
                ).map((advice, idx) => (
                  <li
                    key={advice}
                    className="flex items-start gap-2.5 rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-700 ring-1 ring-slate-200/70 sm:text-sm"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-extrabold text-amber-800">
                      {idx + 1}
                    </span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ol>

              {!isPro && (
                <div className="mt-4">
                  <ProUpgradeCard
                    onUpgrade={onUpgradeToPro}
                    detail="升級專業版即可解鎖無限次 AI 分析、高階安撫談判話術與完整多步驟 SOP 預防方案。"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
