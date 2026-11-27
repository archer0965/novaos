"use client";

import { useState } from "react";
import { RotateCcw, Smartphone } from "lucide-react";
import { CustomerFeedbackFlow } from "@/components/novashield/feedback/CustomerFeedbackFlow";
import type { ShopConfig } from "@/lib/novashield/types";

interface LivePhonePreviewProps {
  config: ShopConfig;
}

export function LivePhonePreview({ config }: LivePhonePreviewProps) {
  const [previewKey, setPreviewKey] = useState(0);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">顧客端即時預覽</h2>
            <p className="text-[11px] text-slate-500">
              {config.plan === "PRO"
                ? "專業版：多維度評分 × 品牌視覺 × LINE 私訊跳轉"
                : "免費版：單一總體星等 × Email 客訴表單"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPreviewKey((k) => k + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>重置預覽</span>
        </button>
      </div>

      {/* Simulated Mobile Bezel */}
      <div className="mx-auto max-w-[390px] rounded-[2rem] border-[6px] border-slate-900 bg-gradient-to-b from-amber-50/40 via-slate-50 to-slate-100/80 p-3 shadow-inner">
        <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-slate-300" />
        <div className="max-h-[680px] overflow-y-auto pr-0.5">
          <CustomerFeedbackFlow
            key={`${config.shopId}-${config.plan}-${config.ratingMode ?? "multi"}-${previewKey}`}
            shop={config}
            isPreview
          />
        </div>
      </div>
    </div>
  );
}
