"use client";

import { ExternalLink, Scale } from "lucide-react";

interface CustomerRightsNoticeProps {
  googleReviewUrl: string;
  compact?: boolean;
}

export function CustomerRightsNotice({
  googleReviewUrl,
  compact = false,
}: CustomerRightsNoticeProps) {
  return (
    <footer
      aria-label="顧客公開評論權利須知"
      className={`mt-5 rounded-2xl border border-gray-200/80 bg-white/80 text-xs leading-relaxed text-gray-500 shadow-sm ${
        compact ? "p-3.5" : "p-4 sm:p-5"
      }`}
    >
      <div className="flex items-start gap-2">
        <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
        <div className="space-y-1.5 text-left">
          <p className="font-semibold text-gray-600">【顧客公開評論權利須知】</p>
          <p>
            本系統係由【Nova商譽寶 (NovaShield)】提供之門市顧客滿意度調查與客服輔助工具。我們尊重並保障每位消費者的自由表達權利。
          </p>
          <p>
            依據台灣《公平交易法》第 21 條及第 25 條規範，以及 Google Maps
            商家評論政策，本系統絕不強制限制、掩飾或阻擋消費者發表真實消費體驗。
          </p>
          <p>
            不論您於本系統選擇之星等為何，您皆享有隨時前往 Google Maps
            留下公開評論之完整權利。
          </p>
        </div>
      </div>

      <div className="mt-3.5 border-t border-gray-100 pt-3 text-center">
        <a
          href={googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-gray-600 transition hover:border-amber-300 hover:bg-amber-50/70 hover:text-amber-800"
        >
          <span>點此直接前往 Google Maps 發表公開評論</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
        <p className="mt-2 text-[11px] text-gray-400">
          Powered by Nova商譽寶 (NovaShield) ・ 拓新雲端 (Nova Cloud)
        </p>
      </div>
    </footer>
  );
}
