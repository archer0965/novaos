"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  FileText,
  Maximize2,
  ShieldCheck,
  X,
} from "lucide-react";

const TERMS_ARTICLES = [
  {
    title: "第一條（系統定位與服務範圍）",
    items: [
      "1. Nova商譽寶（以下簡稱「本系統」）係由拓新雲端（Nova Cloud）開發並提供之門市顧客滿意度調查、意見收集與 LINE 即時客服導流輔助工具。",
      "2. 本系統僅提供技術平台與對話介面串接服務，並非代刷評論、虛偽好評或惡意阻擋評論之灰產工具。",
    ],
  },
  {
    title: "第二條（法令遵循與平台規範）",
    items: [
      "1. 店家使用本系統時，應確保恪遵台灣《公平交易法》第 21 條（禁止不實廣告與引人錯誤之表示）、第 25 條（禁止顯失公平之行為）以及《消費者保護法》相關規範。",
      "2. 店家不得透過贈利、脅迫或任何不正當手段，強制要求消費者於第三方平台（包括但不限於 Google Maps）給予特定星等評分。",
      "3. 店家理解並同意，Google Maps 平台嚴禁 Review Gating（惡意篩選/阻擋負評）行為。本系統已預設保留消費者直接跳轉至 Google Maps 評論之公開管道，店家不得要求本系統移除該合規機制。",
    ],
  },
  {
    title: "第三條（免責聲明）",
    items: [
      "1. 因顧客消費糾紛、Google 商家帳號受平台審查、評價被系統自動過濾或刪除等非本系統可控之因素，本系統及拓新雲端不承擔任何直接、間接或附帶之商業損害賠償責任。",
      "2. 店家透過 LINE 官方帳號或 Email 與顧客進行之私下溝通、退款或補償事宜，均由店家與消費者自行處理，與本系統無涉。",
    ],
  },
];

function TermsArticleContent() {
  return (
    <div className="space-y-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
      <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-4 py-3 text-xs font-semibold text-emerald-900">
        《Nova商譽寶 (NovaShield) 店家服務條款與合規聲明》
      </div>

      {TERMS_ARTICLES.map((article) => (
        <div key={article.title} className="space-y-1.5">
          <h4 className="text-sm font-bold text-slate-900">{article.title}</h4>
          <ul className="space-y-1.5 pl-0.5">
            {article.items.map((line) => (
              <li key={line} className="leading-relaxed text-slate-600">
                {line}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

interface MerchantTermsSectionProps {
  defaultOpen?: boolean;
}

export function MerchantTermsSection({
  defaultOpen = false,
}: MerchantTermsSectionProps) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="flex flex-1 items-center gap-3 text-left"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                Nova商譽寶 服務條款與合規指南
              </h2>
              <p className="text-xs text-slate-500">
                依據台灣《公平交易法》第 21、25 條與 Google Maps 商家評論政策制定（拓新雲端 Nova Cloud）
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50/60 hover:text-amber-800"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>彈窗檢視全文</span>
            </button>

            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              <span>{expanded ? "收合條文" : "展開條文"}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-5">
            <TermsArticleContent />
          </div>
        )}
      </section>

      {/* Modal Dialog */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="novashield-tos-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <FileText className="h-4 w-4" />
                </div>
                <h3
                  id="novashield-tos-modal-title"
                  className="text-base font-bold text-slate-900"
                >
                  Nova商譽寶 服務條款與合規指南
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="關閉視窗"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              <TermsArticleContent />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
              <span className="text-[11px] text-slate-400">
                拓新雲端（Nova Cloud）版權所有
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                我已瞭解並關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
