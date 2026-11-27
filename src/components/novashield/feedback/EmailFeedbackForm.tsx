"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Mail, Send, ShieldCheck } from "lucide-react";
import { sendEmailFeedback } from "@/lib/novashield/email";
import type { EmailFeedbackResult } from "@/lib/novashield/types";

interface EmailFeedbackFormProps {
  shopId: string;
  shopName: string;
  contactEmail: string;
  emailFormEndpoint?: string;
  rating: number;
  onEmailSent: (result: EmailFeedbackResult) => void;
  compact?: boolean;
}

export function EmailFeedbackForm({
  shopId,
  shopName,
  contactEmail,
  emailFormEndpoint,
  rating,
  onEmailSent,
  compact = false,
}: EmailFeedbackFormProps) {
  const [suggestion, setSuggestion] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = suggestion.trim();
    if (!trimmed) {
      setErrorMessage("請填寫改善建議，以便系統寄送 Email 通知店家。");
      return;
    }

    setSending(true);
    setErrorMessage(null);

    try {
      const result = await sendEmailFeedback({
        shopId,
        shopName,
        contactEmail,
        emailFormEndpoint,
        rating,
        suggestion: trimmed,
        customerName: customerName.trim(),
        phone: phone.trim(),
      });
      onEmailSent(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "發送 Email 通知時發生錯誤，請稍後再試。",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-sm ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
      noValidate
    >
      <div className="mb-4 flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 text-slate-800 ring-1 ring-slate-200/70">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <Mail className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-amber-800">
            總體評分 {rating} 星
          </p>
          <p className="text-sm leading-relaxed font-medium text-slate-800">
            很抱歉沒能給您滿意的體驗，請留下您的建議，系統將透過 Email 通知店家進行改善。
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor={`email-feedback-suggestion-${shopId}`}
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
            id={`email-feedback-suggestion-${shopId}`}
            required
            rows={compact ? 3 : 4}
            maxLength={500}
            value={suggestion}
            onChange={(e) => {
              setSuggestion(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="請告訴我們本次消費可以改進的地方..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`email-feedback-name-${shopId}`}
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              姓名 <span className="text-xs font-normal text-slate-400">(選填)</span>
            </label>
            <input
              id={`email-feedback-name-${shopId}`}
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
              htmlFor={`email-feedback-phone-${shopId}`}
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              電話 <span className="text-xs font-normal text-slate-400">(選填)</span>
            </label>
            <input
              id={`email-feedback-phone-${shopId}`}
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
          disabled={sending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>正在發送 Email 通知店家...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>送出意見（Email 通知店家）</span>
            </>
          )}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
          <span>您的建議將透過 Email 寄送至店家信箱，作為內部改善依據</span>
        </p>
      </div>
    </form>
  );
}
