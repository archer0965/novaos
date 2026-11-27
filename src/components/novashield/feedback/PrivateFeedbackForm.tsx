"use client";

import { useState } from "react";
import { AlertCircle, ExternalLink, MessageCircle, ShieldCheck } from "lucide-react";
import { buildLineDeepLink } from "@/lib/novashield/line";
import type { DimensionScore, LineDeepLinkResult } from "@/lib/novashield/types";
import { normalizeLineOfficialId } from "@/lib/novashield/validation";

interface PrivateFeedbackFormProps {
  shopId: string;
  shopName: string;
  lineOfficialId: string;
  roundedRating: number;
  exactAverage: number;
  dimensions?: DimensionScore[];
  onDeepLinkGenerated: (result: LineDeepLinkResult) => void;
  compact?: boolean;
}

export function PrivateFeedbackForm({
  shopId,
  shopName,
  lineOfficialId,
  roundedRating,
  exactAverage,
  dimensions,
  onDeepLinkGenerated,
  compact = false,
}: PrivateFeedbackFormProps) {
  const [suggestion, setSuggestion] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayLineId = normalizeLineOfficialId(lineOfficialId) || "@ourshop";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = suggestion.trim();
    if (!trimmed) {
      setErrorMessage("請填寫改善建議，以便帶入 LINE 訊息讓店長立即了解狀況。");
      return;
    }

    setErrorMessage(null);

    const result = buildLineDeepLink({
      lineOfficialId: displayLineId,
      shopName,
      rating: roundedRating,
      exactAverage,
      dimensions,
      suggestion: trimmed,
      customerName: customerName.trim(),
      phone: phone.trim(),
    });

    window.open(result.deepLinkUrl, "_blank", "noopener,noreferrer");
    onDeepLinkGenerated(result);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-sm ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
      noValidate
    >
      <div className="mb-4 flex items-start gap-3 rounded-xl bg-amber-50/80 p-3.5 text-slate-800">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#06C755]/15 text-[#06C755]">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-amber-800">
            綜合評分 {roundedRating} 星
            {exactAverage !== roundedRating
              ? `（平均 ${exactAverage.toFixed(1)}）`
              : ""}
          </p>
          <p className="text-sm leading-relaxed font-medium text-slate-800">
            很抱歉沒能給您完美的體驗，請填寫建議後一鍵透過 LINE 私訊店長，我們將立即為您處理。
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor={`feedback-suggestion-${shopId}`}
            className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-800"
          >
            <span>
              改善建議 <span className="text-rose-500">*</span>
            </span>
            <span className="text-xs font-normal text-slate-400">
              {suggestion.length} / 500
            </span>
          </label>
          <textarea
            id={`feedback-suggestion-${shopId}`}
            required
            rows={compact ? 3 : 4}
            maxLength={500}
            value={suggestion}
            onChange={(e) => {
              setSuggestion(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="例如：出餐時間較久、餐點口味偏鹹、座位空調或服務細節..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`feedback-name-${shopId}`}
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              姓名 <span className="text-xs font-normal text-slate-400">(選填)</span>
            </label>
            <input
              id={`feedback-name-${shopId}`}
              type="text"
              maxLength={60}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="例如：陳小姐"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor={`feedback-phone-${shopId}`}
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              電話 <span className="text-xs font-normal text-slate-400">(選填)</span>
            </label>
            <input
              id={`feedback-phone-${shopId}`}
              type="tel"
              maxLength={40}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912-345-678"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            />
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#06C755] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#05b24c] active:scale-[0.99]"
        >
          <MessageCircle className="h-4 w-4 fill-white" />
          <span>私訊店長處理</span>
          <ExternalLink className="h-4 w-4" />
        </button>

        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-[#06C755]" />
          <span>
            將自動帶入評分與建議，跳轉至店家 LINE 官方帳號（{displayLineId}）
          </span>
        </p>
      </div>
    </form>
  );
}
