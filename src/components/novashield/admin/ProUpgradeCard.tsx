"use client";

import { CreditCard, Lock } from "lucide-react";

interface ProUpgradeCardProps {
  onUpgrade?: () => void;
  detail?: string;
}

export function ProUpgradeCard({ onUpgrade, detail }: ProUpgradeCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50 via-amber-50/70 to-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Lock className="h-4 w-4" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
              付費升級開啟功能
            </span>
            <p className="text-sm font-bold text-slate-900">
              升級專業版 ($199/月 或 $1,990/年) 解鎖 LINE 即時私訊對話與多維度評分
            </p>
          </div>
          {detail && (
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {detail}
            </p>
          )}
        </div>
      </div>

      {onUpgrade && (
        <button
          type="button"
          onClick={onUpgrade}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0F172A] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
        >
          <CreditCard className="h-3.5 w-3.5 text-[#F59E0B]" />
          <span>付費升級開啟功能</span>
        </button>
      )}
    </div>
  );
}
