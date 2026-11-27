"use client";

import { ExternalLink, Heart, RotateCcw, Sparkles, Star } from "lucide-react";

interface PositiveReviewCardProps {
  shopName: string;
  roundedRating: number;
  exactAverage: number;
  googleReviewUrl: string;
  accentColor?: string;
  onResetRating?: () => void;
  compact?: boolean;
}

export function PositiveReviewCard({
  shopName,
  roundedRating,
  exactAverage,
  googleReviewUrl,
  accentColor = "#F59E0B",
  onResetRating,
  compact = false,
}: PositiveReviewCardProps) {
  return (
    <div
      className={`rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/90 to-white shadow-sm ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
          <Heart className="h-6 w-6 fill-amber-500 text-amber-500" />
        </div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-800">
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            綜合評分 {roundedRating} 星
            {exactAverage !== roundedRating ? `（平均 ${exactAverage.toFixed(1)}）` : ""}
          </span>
        </div>

        <h2 className="text-lg font-bold text-slate-900">
          非常感謝您對 {shopName} 的肯定！
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          您的好評是團隊持續進步的最大動力。邀請您花 10 秒將這份美好體驗分享到 Google
          Maps，幫助更多朋友認識我們。
        </p>

        <div className="mt-3 flex items-center gap-1" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`h-5 w-5 ${
                n <= roundedRating
                  ? "fill-[#F59E0B] text-[#F59E0B]"
                  : "fill-transparent text-slate-300"
              }`}
            />
          ))}
        </div>

        <a
          href={googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ backgroundColor: accentColor }}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-[0.99]"
        >
          <Star className="h-4 w-4 fill-white" />
          <span>前往 Google Maps 留下 5 星評論</span>
          <ExternalLink className="h-4 w-4" />
        </a>

        {onResetRating && (
          <button
            type="button"
            onClick={onResetRating}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>重新調整星等</span>
          </button>
        )}
      </div>
    </div>
  );
}
