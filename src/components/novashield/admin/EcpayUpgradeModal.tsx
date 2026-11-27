"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BellRing,
  Check,
  CreditCard,
  Crown,
  Loader2,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import { NOVASHIELD_PRICES } from "@/lib/novashield/subscription";
import type { BillingCycle } from "@/lib/novashield/types";
import { isValidEmail } from "@/lib/novashield/validation";

interface EcpayUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  shopId: string;
  shopName: string;
  defaultEmail: string;
  initialCycle?: BillingCycle;
  isRenewal?: boolean;
}

const PRO_BENEFITS = [
  "LINE 官方帳號 Deep Link 私訊引導（1–3 星一鍵喚起 LINE 對話）",
  "多維度自訂評分項目（餐點品質、服務態度、環境衛生自由增減）",
  "自訂品牌 Logo 上傳與品牌主題色客製化",
  "彈性調整分流星等門檻（3 / 4 / 5 星）",
  "到期前 3 天自動寄送 Email 繳費提醒至店家信箱",
];

export function EcpayUpgradeModal({
  open,
  onClose,
  shopId,
  shopName,
  defaultEmail,
  initialCycle = "monthly",
  isRenewal = false,
}: EcpayUpgradeModalProps) {
  const [cycle, setCycle] = useState<BillingCycle>(initialCycle);
  const [email, setEmail] = useState(defaultEmail);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCycle(initialCycle);
      setEmail(defaultEmail);
      setErrorMessage(null);
      setSubmitting(false);
    }
  }, [open, initialCycle, defaultEmail]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const amount = NOVASHIELD_PRICES[cycle];

  async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setErrorMessage("請輸入有效的店家信箱（用於收款開通通知與到期前 3 天續費提醒）。");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/novashield/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId,
          shopName,
          cycle,
          emailNotification: trimmedEmail,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || contentType.includes("application/json")) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setErrorMessage(
          data.error || "無法建立綠界付款訂單，請檢查金流設定後再試。",
        );
        setSubmitting(false);
        return;
      }

      const html = await response.text();
      const doc = document.open("text/html", "replace");
      doc.write(html);
      doc.close();
    } catch {
      setErrorMessage("無法連線至結帳服務，請稍後再試。");
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ecpay-upgrade-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0F172A] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B] text-white shadow-sm">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wide text-amber-300">
                拓新雲端 NovaOS・綠界 ECPay 安全收款
              </p>
              <h3
                id="ecpay-upgrade-modal-title"
                className="text-lg font-extrabold"
              >
                {isRenewal ? "續費 Nova商譽寶 專業版" : "付費升級開啟專業版功能"}
              </h3>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            aria-label="關閉視窗"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleCheckout} className="space-y-5 p-6">
          {/* Shop Target */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-xs">
            <span className="text-slate-500">套用門市</span>
            <span className="font-bold text-slate-900">
              {shopName}（<span className="font-mono">{shopId}</span>）
            </span>
          </div>

          {/* Cycle Selector (Fixed Immutable Pricing: $199/mo or $1,990/yr) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={`rounded-2xl border-2 p-4 text-left transition ${
                cycle === "monthly"
                  ? "border-[#F59E0B] bg-amber-50/70"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-bold text-slate-500">月繳方案</p>
              <p className="mt-1 text-2xl font-black text-[#0F172A]">
                $199{" "}
                <span className="text-xs font-semibold text-slate-500">/ 月</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-500">開通 30 天專業版</p>
            </button>

            <button
              type="button"
              onClick={() => setCycle("yearly")}
              className={`relative rounded-2xl border-2 p-4 text-left transition ${
                cycle === "yearly"
                  ? "border-[#F59E0B] bg-amber-50/70"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="absolute -top-2.5 right-3 rounded-full bg-[#F59E0B] px-2 py-0.5 text-[10px] font-extrabold text-white">
                現省 $398
              </span>
              <p className="text-xs font-bold text-slate-500">年繳方案</p>
              <p className="mt-1 text-2xl font-black text-[#0F172A]">
                $1,990{" "}
                <span className="text-xs font-semibold text-slate-500">/ 年</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                開通 365 天（平均 $166/月）
              </p>
            </button>
          </div>

          {/* Billing Email for 3-day Expiry Reminders */}
          <div>
            <label
              htmlFor="ecpay-billing-email"
              className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800"
            >
              <Mail className="h-4 w-4 text-amber-600" />
              <span>
                店家帳單與續費提醒信箱 <span className="text-rose-500">*</span>
              </span>
            </label>
            <input
              id="ecpay-billing-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="owner@yourshop.tw"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            />
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
              <BellRing className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span>
                系統將於每月／每年方案<strong>到期前 3 天</strong>自動寄送 Email 提醒您續費。
              </span>
            </p>
          </div>

          {/* Included Features Summary */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
            <p className="mb-2 text-xs font-bold text-slate-700">
              付款完成後立即解鎖全部專業版功能：
            </p>
            <ul className="space-y-1.5">
              {PRO_BENEFITS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs text-slate-600"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F59E0B] px-5 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-amber-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>正在導向綠界 ECPay 收銀台...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>
                  前往綠界 ECPay 付款（NT${amount.toLocaleString("zh-TW")}）
                </span>
              </>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>由拓新雲端 NovaOS 綠界金流加密收款，付款成功後自動開通</span>
          </p>
        </form>
      </div>
    </div>
  );
}
