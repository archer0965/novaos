"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Crown,
  ExternalLink,
  Link2,
  Lock,
  MessageCircle,
} from "lucide-react";
import { ProUpgradeCard } from "./ProUpgradeCard";
import { buildLineDeepLink } from "@/lib/novashield/line";
import type { ShopConfig } from "@/lib/novashield/types";
import {
  isValidLineOfficialId,
  normalizeLineOfficialId,
} from "@/lib/novashield/validation";

interface LineConfigPanelProps {
  config: ShopConfig;
  onLineIdChange: (lineId: string) => void;
  onUpgradeToPro: () => void;
}

export function LineConfigPanel({
  config,
  onLineIdChange,
  onUpgradeToPro,
}: LineConfigPanelProps) {
  const [copied, setCopied] = useState(false);
  const isPro = config.plan === "PRO";

  const normalizedId = normalizeLineOfficialId(config.lineId);
  const idInvalid =
    isPro &&
    config.lineId.trim() !== "" &&
    !isValidLineOfficialId(config.lineId);

  const sampleDeepLink = buildLineDeepLink({
    lineOfficialId: normalizedId || "@shop123",
    shopName: config.shopName,
    rating: Math.max(1, config.thresholdStar - 1),
    dimensions:
      config.ratingMode !== "single"
        ? config.ratingCategories.map((label, i) => ({
            label,
            score: i === 0 ? 3 : 2,
          }))
        : undefined,
    suggestion: "今日尖峰時段候餐時間較久，希望出餐動線可以再優化。",
    customerName: "林小姐",
    phone: "0912-345-678",
  });

  async function handleCopyDeepLink() {
    if (!isPro) return;
    try {
      await navigator.clipboard.writeText(sampleDeepLink.deepLinkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isPro
                ? "bg-[#06C755]/15 text-[#06C755]"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {isPro ? (
              <MessageCircle className="h-5 w-5" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              LINE 官方帳號 Deep Link 私訊引導
            </h2>
            <p className="text-xs text-slate-500">
              {isPro
                ? "低星顧客點擊「私訊店長處理」即喚起手機 LINE App 並預填意見內容"
                : "免費版僅支援 Email 客訴表單，不包含 LINE 跳轉或私訊引導功能"}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            isPro
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {isPro ? (
            <>
              <Crown className="h-3 w-3" />
              <span>專業版已解鎖</span>
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" />
              <span>專業版專屬鎖定</span>
            </>
          )}
        </span>
      </div>

      {!isPro && (
        <div className="mb-4">
          <ProUpgradeCard
            onUpgrade={onUpgradeToPro}
            detail="升級專業版後，1–3 星顧客點擊「私訊店長處理」將直接透過 line.me/R/oaMessage 開啟 LINE App 與店家官方帳號對話。"
          />
        </div>
      )}

      <div
        className={`space-y-4 ${
          !isPro ? "pointer-events-none select-none opacity-50" : ""
        }`}
        aria-disabled={!isPro}
      >
        <div>
          <label
            htmlFor="line-official-id"
            className="mb-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800"
          >
            {!isPro && <Lock className="h-3.5 w-3.5 text-slate-400" />}
            <span>LINE 官方帳號 ID（Basic ID / Premium ID）</span>
          </label>
          <input
            id="line-official-id"
            type="text"
            disabled={!isPro}
            maxLength={64}
            value={isPro ? config.lineId : ""}
            onChange={(e) => onLineIdChange(e.target.value)}
            onBlur={() => {
              if (isPro && config.lineId.trim()) {
                onLineIdChange(normalizeLineOfficialId(config.lineId));
              }
            }}
            placeholder={
              isPro
                ? "例如：@shop123 或 @ourshop"
                : "升級專業版後即可綁定 LINE 官方帳號 ID（如 @shop123）"
            }
            className={`w-full rounded-xl border bg-slate-50/60 px-3.5 py-2.5 font-mono text-sm text-slate-900 placeholder:font-sans placeholder:text-slate-400 transition focus:bg-white focus:ring-2 focus:outline-none disabled:cursor-not-allowed ${
              idInvalid
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-200 focus:border-[#06C755] focus:ring-[#06C755]/20"
            }`}
          />
          {idInvalid ? (
            <p className="mt-1 text-xs text-rose-600">
              請輸入有效的 LINE 官方帳號 ID（以 @ 開頭，僅限英數字、底線、點號與連字號）。
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-400">
              將自動組合跳轉格式：
              <code className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                https://line.me/R/oaMessage/{normalizedId || "@shop123"}/?&#123;encodedMessage&#125;
              </code>
            </p>
          )}
        </div>

        {/* Live LINE Prefilled Message & Deep Link Preview */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#8CABD9]/25">
          <div className="flex items-center justify-between bg-[#06C755] px-4 py-2 text-xs font-bold text-white">
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 fill-white" />
              LINE 預填私訊預覽（{sampleDeepLink.lineOfficialId}）
            </span>
            <span className="font-mono text-[10px] opacity-90">
              LINE oaMessage Deep Link
            </span>
          </div>
          <div className="space-y-3 p-3.5">
            <div className="max-w-full rounded-2xl rounded-tl-sm bg-white p-3.5 shadow-sm">
              <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-slate-800">
                {sampleDeepLink.messageText}
              </pre>
            </div>

            <div className="rounded-xl bg-white/90 p-3 ring-1 ring-slate-200/80">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600">
                  <Link2 className="h-3.5 w-3.5 text-[#06C755]" />
                  即時產出測試連結
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!isPro}
                    onClick={handleCopyDeepLink}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>已複製</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>複製</span>
                      </>
                    )}
                  </button>
                  <a
                    href={isPro ? sampleDeepLink.deepLinkUrl : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!isPro}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#06C755] px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-[#05b24c]"
                  >
                    <span>測試跳轉</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <p className="break-all font-mono text-[11px] leading-relaxed text-slate-500">
                {sampleDeepLink.deepLinkUrl}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
