"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  CreditCard,
  Crown,
  Loader2,
  Lock,
  MessageCircle,
  PlusCircle,
  Sparkles,
  Tag,
} from "lucide-react";
import type {
  AiAnalyzeApiResponse,
  AiFeedbackAnalysis,
  AiSeverity,
} from "@/lib/novashield/aiAnalyzer";
import {
  AI_TOPUP_PACK,
  applyTopupPackToQuota,
  computeAiQuotaSnapshot,
  normalizeAiQuotaState,
  type AiQuotaState,
} from "@/lib/novashield/aiQuota";
import type { ShopConfig } from "@/lib/novashield/types";

interface AiFeedbackCoachProps {
  config: ShopConfig;
  initialText?: string;
  onUpgradeToPro: () => void;
}

const QUOTA_STORAGE_PREFIX = "novaos:novashield:ai-quota:v2";

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

function readLocalQuotaState(
  shopId: string,
  serverSeed?: Partial<AiQuotaState> | null,
): AiQuotaState {
  const normalizedServer = normalizeAiQuotaState(serverSeed);
  if (typeof window === "undefined") return normalizedServer;
  try {
    const raw = window.localStorage.getItem(
      `${QUOTA_STORAGE_PREFIX}:${shopId}`,
    );
    if (!raw) return normalizedServer;
    const parsed = normalizeAiQuotaState(
      JSON.parse(raw) as Partial<AiQuotaState>,
    );
    return {
      monthKey: parsed.monthKey,
      monthlyUsed: Math.max(normalizedServer.monthlyUsed, parsed.monthlyUsed),
      topupRemaining: Math.max(
        normalizedServer.topupRemaining,
        parsed.topupRemaining,
      ),
      lastTopupOrderId:
        parsed.lastTopupOrderId ?? normalizedServer.lastTopupOrderId ?? null,
      lastTopupAt: parsed.lastTopupAt ?? normalizedServer.lastTopupAt ?? null,
      novaosBillingAccountId:
        parsed.novaosBillingAccountId ??
        normalizedServer.novaosBillingAccountId ??
        null,
    };
  } catch {
    return normalizedServer;
  }
}

function writeLocalQuotaState(shopId: string, state: AiQuotaState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${QUOTA_STORAGE_PREFIX}:${shopId}`,
      JSON.stringify(state),
    );
  } catch {
    // ignore storage quota errors
  }
}

const SEVERITY_STYLE: Record<AiSeverity, { label: string; className: string }> =
  {
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
  const [topupToast, setTopupToast] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AiFeedbackAnalysis | null>(null);
  const [analysisMode, setAnalysisMode] = useState<
    "gemini" | "openai" | "mock" | null
  >(null);
  const [lastDeductedFrom, setLastDeductedFrom] = useState<
    "monthly" | "topup" | null
  >(null);
  const [copiedReply, setCopiedReply] = useState(false);
  const [quotaState, setQuotaState] = useState<AiQuotaState>(() =>
    normalizeAiQuotaState(config.aiQuota),
  );

  const isPro = config.plan === "PRO";
  const quota = computeAiQuotaSnapshot(config.plan, quotaState);
  const isOutOfQuota = quota.totalRemaining <= 0;

  useEffect(() => {
    setQuotaState(readLocalQuotaState(config.shopId, config.aiQuota));
  }, [config.shopId, config.aiQuota]);

  useEffect(() => {
    if (initialText) {
      setFeedbackText(initialText);
      setErrorMessage(null);
    }
  }, [initialText]);

  /**
   * Simulates purchasing the $49 / +30 AI analysis top-up pack.
   * TODO (NovaOS 拓新雲端金流整合):
   * Replace this local simulation with POST /api/novashield/checkout (item: ai_topup_30, amount: 49)
   * and credit topupRemaining from the verified ECPay callback / NovaOS account billing ledger.
   */
  function handleSimulateTopupPack() {
    const nextState = applyTopupPackToQuota(quotaState, {
      orderId: `SIM-TOPUP-${Date.now()}`,
    });
    setQuotaState(nextState);
    writeLocalQuotaState(config.shopId, nextState);
    setErrorMessage(null);
    setTopupToast(
      `已模擬購買成功！加購包額度 +${AI_TOPUP_PACK.credits} 次（目前加購剩餘 ${nextState.topupRemaining} 次，跨月不歸零）。`,
    );
    setTimeout(() => setTopupToast(null), 4000);
  }

  async function handleAnalyze() {
    const trimmed = feedbackText.trim();
    if (!trimmed) {
      setErrorMessage("請先貼上顧客負評或點擊上方範例文字。");
      return;
    }

    if (isOutOfQuota) {
      setErrorMessage(
        "本月與加購 AI 分析次數已用完，請購買「$49 加購 30 次」或升級專業版。",
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
          shopId: config.shopId,
          shopName: config.shopName,
          feedbackText: trimmed,
          quotaState,
        }),
      });

      const data = (await response.json()) as AiAnalyzeApiResponse;

      if (data.quotaState) {
        setQuotaState(data.quotaState);
        writeLocalQuotaState(config.shopId, data.quotaState);
      }

      if (!response.ok || !data.ok || !data.result) {
        setErrorMessage(
          data.error ||
            (response.status === 403
              ? "本月與加購 AI 分析次數已用完，請購買「$49 加購 30 次」或升級專業版。"
              : "AI 分析失敗，請稍後再試。"),
        );
        return;
      }

      setAnalysis(data.result);
      setAnalysisMode(data.mode);
      setLastDeductedFrom(data.quota?.deductedFrom ?? null);
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
      {/* Main Input & Quota Card */}
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
                貼上顧客負評或客訴原文，AI 即時判斷問題歸因與風險等級，產出溫暖誠懇的 LINE 回覆話術與店內改善 SOP
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
              isPro
                ? "bg-amber-50 text-amber-800 ring-amber-200"
                : "bg-slate-100 text-slate-700 ring-slate-200"
            }`}
          >
            {isPro ? (
              <>
                <Crown className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span>專業版：每月 20 次額度</span>
              </>
            ) : (
              <span>免費版：每月 5 次額度</span>
            )}
          </span>
        </div>

        {/* Quota Status Bar + $49 Top-Up Pack Button */}
        <div className="mb-5 rounded-2xl border border-slate-200/80 bg-[#FAF8F5] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold text-slate-500">
                  本月方案剩餘額度（{quota.monthKey} 重置，不累積）
                </p>
                <p className="mt-1 flex items-baseline gap-1">
                  <span
                    className={`text-xl font-black ${
                      quota.monthlyRemaining > 0
                        ? "text-[#0F172A]"
                        : "text-rose-600"
                    }`}
                  >
                    本月剩餘 {quota.monthlyRemaining}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    / {quota.monthlyLimit} 次
                  </span>
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold text-slate-500">
                  單次加購包剩餘次數（用完才扣，跨月不歸零）
                </p>
                <p className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-black text-amber-700">
                    加購剩餘 {quota.topupRemaining}
                  </span>
                  <span className="text-xs font-bold text-slate-400">次</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <button
                type="button"
                onClick={handleSimulateTopupPack}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-amber-600 active:scale-[0.99]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>購買 $49 加購包（+30 次）</span>
              </button>

              {!isPro && (
                <button
                  type="button"
                  onClick={onUpgradeToPro}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 transition hover:border-[#0F172A] hover:bg-slate-50"
                >
                  <CreditCard className="h-3.5 w-3.5 text-[#F59E0B]" />
                  <span>升級專業版（每月 20 次）</span>
                </button>
              )}
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-500">
            扣點順序：優先扣除「本月方案剩餘額度」，本月用完後自動扣除「單次加購剩餘額度」；加購次數永久有效、不隨月份歸零。
          </p>
        </div>

        {topupToast && (
          <div
            role="status"
            className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{topupToast}</span>
          </div>
        )}

        {/* Exhausted Quota Hard Lock Notice */}
        {isOutOfQuota && (
          <div
            role="alert"
            className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-900">
                  本月與加購 AI 分析次數已用完，請購買「$49 加購 30 次」或升級專業版。
                </p>
                <p className="mt-0.5 text-xs text-rose-700">
                  加購包單次只需 NT$49 即可獲得 30 次額度且不會每月歸零；升級專業版每月享 20 次額度並解鎖 LINE 私訊引導。
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSimulateTopupPack}
                className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-amber-600"
              >
                購買 $49 加購 30 次
              </button>
              {!isPro && (
                <button
                  type="button"
                  onClick={onUpgradeToPro}
                  className="rounded-xl bg-[#0F172A] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
                >
                  升級專業版
                </button>
              )}
            </div>
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
          <p className="text-xs text-slate-500">
            本次可用總額度：
            <strong className="text-slate-800">{quota.totalRemaining} 次</strong>
            （本月 {quota.monthlyRemaining} 次 ＋ 加購 {quota.topupRemaining} 次）
          </p>

          <button
            type="button"
            disabled={analyzing || isOutOfQuota}
            onClick={() => void handleAnalyze()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-[#0F172A] to-slate-800 px-5 py-4 text-white">
            <div className="flex flex-wrap items-center gap-2">
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

            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              {lastDeductedFrom && (
                <span className="rounded-md bg-white/10 px-2 py-0.5 font-semibold text-amber-200">
                  {lastDeductedFrom === "monthly"
                    ? "已扣除本月方案額度 1 次"
                    : "已扣除加購包額度 1 次"}
                </span>
              )}
              <span>
                {analysisMode === "gemini"
                  ? "Gemini AI 即時推論"
                  : analysisMode === "openai"
                    ? "OpenAI 即時推論"
                    : "NovaOS 專家模型"}
              </span>
            </div>
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
              <h4 className="mb-3 inline-flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
                <ClipboardList className="h-4 w-4 text-amber-600" />
                <span>店內營運改善建議（Internal Action SOP）</span>
              </h4>

              <ol className="space-y-2.5">
                {analysis.internalAdvice.map((advice, idx) => (
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
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
