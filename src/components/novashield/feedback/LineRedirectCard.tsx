"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import type { LineDeepLinkResult } from "@/lib/novashield/types";

interface LineRedirectCardProps {
  shopName: string;
  result: LineDeepLinkResult;
  onReset?: () => void;
  compact?: boolean;
}

export function LineRedirectCard({
  shopName,
  result,
  onReset,
  compact = false,
}: LineRedirectCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(result.deepLinkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div
      className={`rounded-2xl border border-emerald-200/80 bg-white shadow-sm ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#06C755]/15 text-[#06C755]">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h2 className="text-lg font-bold text-slate-900">
          已準備好您的 LINE 私訊內容！
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          系統已自動帶入星等與改善建議，並開啟{" "}
          <span className="font-semibold text-slate-800">{shopName}</span> LINE
          官方帳號（<span className="font-mono text-xs font-semibold text-[#059669]">{result.lineOfficialId}</span>
          ）。若未自動跳轉，請點擊下方按鈕。
        </p>

        <a
          href={result.deepLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#06C755] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#05b24c] active:scale-[0.99]"
        >
          <MessageCircle className="h-4 w-4 fill-white" />
          <span>立即開啟 LINE 私訊店長</span>
          <ExternalLink className="h-4 w-4" />
        </a>

        {/* Generated Deep Link Inspector for easy testing & verification */}
        <div className="mt-4 w-full space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-left">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-600">
              產出的 LINE Deep Link
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span>已複製</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>複製連結</span>
                </>
              )}
            </button>
          </div>

          <p className="break-all rounded-lg bg-white p-2.5 font-mono text-[11px] leading-relaxed text-slate-700 ring-1 ring-slate-200/70">
            {result.deepLinkUrl}
          </p>

          <div>
            <p className="mb-1 text-[11px] font-bold text-slate-500">
              自動預填訊息內容
            </p>
            <pre className="whitespace-pre-wrap break-words rounded-lg bg-white p-2.5 font-sans text-xs leading-relaxed text-slate-700 ring-1 ring-slate-200/70">
              {result.messageText}
            </pre>
          </div>
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>返回重新評分</span>
          </button>
        )}
      </div>
    </div>
  );
}
