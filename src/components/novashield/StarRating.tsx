"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const RATING_LABELS: Record<number, string> = {
  1: "非常不滿意",
  2: "有待加強",
  3: "普通",
  4: "滿意",
  5: "非常滿意",
};

interface StarRatingProps {
  value: number;
  onChange: (score: number) => void;
  label?: string;
  size?: "sm" | "md" | "lg";
  compact?: boolean;
}

export function StarRating({
  value,
  onChange,
  label,
  size = "md",
  compact = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number>(0);
  const activeScore = hovered || value;

  const iconSizeClass =
    size === "lg"
      ? "h-9 w-9 sm:h-10 sm:w-10"
      : size === "sm"
        ? "h-6 w-6"
        : "h-7 w-7 sm:h-8 sm:w-8";

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-800">{label}</span>
          <span
            className={`text-xs font-medium ${
              activeScore > 0 ? "text-amber-600" : "text-slate-400"
            }`}
          >
            {activeScore > 0 ? `${activeScore} 星・${RATING_LABELS[activeScore]}` : "請點選星等"}
          </span>
        </div>
      )}

      <div
        className="flex items-center justify-between gap-1 rounded-xl bg-slate-50/90 px-2 py-2 sm:justify-center sm:gap-2.5"
        role="radiogroup"
        aria-label={label || "星等評分"}
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= activeScore;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${label ? `${label} ` : ""}${star} 顆星（${RATING_LABELS[star]}）`}
              onMouseEnter={() => setHovered(star)}
              onClick={() => onChange(star)}
              className="group flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Star
                className={`${iconSizeClass} transition-colors duration-150 ${
                  filled
                    ? "fill-[#F59E0B] text-[#F59E0B] drop-shadow-[0_1px_2px_rgba(245,158,11,0.3)]"
                    : "fill-transparent text-slate-300 group-hover:text-amber-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      {!label && (
        <p className="text-center text-xs font-medium text-slate-500">
          {activeScore > 0 ? (
            <span className="text-amber-600">
              {activeScore} 顆星 — {RATING_LABELS[activeScore]}
            </span>
          ) : (
            "點擊上方星星為本次體驗評分"
          )}
        </p>
      )}
    </div>
  );
}
