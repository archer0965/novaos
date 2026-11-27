"use client";

import { CheckCircle2, Mail, RotateCcw } from "lucide-react";
import type { EmailFeedbackResult } from "@/lib/novashield/types";

interface EmailSentSuccessCardProps {
  shopName: string;
  result: EmailFeedbackResult;
  onReset?: () => void;
  compact?: boolean;
}

export function EmailSentSuccessCard({
  shopName,
  result,
  onReset,
  compact = false,
}: EmailSentSuccessCardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h2 className="text-lg font-bold text-slate-900">
          感謝您的意見，已發送 Email 通知店家！
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          我們已將您的回饋透過 Email 轉交給{" "}
          <span className="font-semibold text-slate-800">{shopName}</span>
          ，店家收到信件後會盡快檢討與處理。
        </p>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          <Mail className="h-3.5 w-3.5 text-slate-500" />
          <span>
            {result.mode === "live"
              ? `已透過 ${result.providerLabel} 寄送至店家信箱`
              : `Email 通知完成（模擬寄送至 ${result.recipientEmail}）`}
          </span>
        </div>

        <details className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50/80 text-left">
          <summary className="cursor-pointer px-3.5 py-2.5 text-xs font-semibold text-slate-600 select-none">
            檢視發送的 Email 客訴通知內容
          </summary>
          <div className="space-y-1.5 border-t border-slate-200 px-3.5 py-3 text-xs text-slate-700">
            <p>
              <span className="font-semibold text-slate-500">收件信箱：</span>
              {result.recipientEmail}
            </p>
            <p>
              <span className="font-semibold text-slate-500">信件主旨：</span>
              {result.subject}
            </p>
            <p>
              <span className="font-semibold text-slate-500">寄送管道：</span>
              {result.providerLabel}
            </p>
            <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-white p-2.5 font-sans text-xs leading-relaxed text-slate-700 ring-1 ring-slate-200/70">
              {result.bodyText}
            </pre>
          </div>
        </details>

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
