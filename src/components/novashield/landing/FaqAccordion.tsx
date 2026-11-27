"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "Q：免費版 ($0) 與專業版 ($199/月) 的主要差別是什麼？",
    answer:
      "免費版提供單一總體星等評分與 Email 客訴通知；專業版解鎖「多維度自訂評分」（如餐點、服務、環境）、自訂品牌 Logo 與主題色，以及「LINE 官方帳號 Deep Link 私訊引導」，讓顧客能直接開啟 LINE 與店家進行一對一即時溝通。",
  },
  {
    question: "Q：專業版的「LINE 即時私訊引導」需要串接複雜的 API 嗎？",
    answer:
      "完全不需要！店家只需在後台填入自己的 LINE 官方帳號 ID（例如 @ourshop），系統會透過原生 Deep Link，在顧客給予低分時自動開啟 LINE App 並預填客訴訊息，讓您零門檻上手。",
  },
  {
    question: "Q：使用 Nova商譽寶 會不會違反 Google 商家政策或台灣法規？",
    answer:
      "不會。本系統定位為「門市滿意度調查與即時客服輔助工具」。我們在頁面底部皆強制保留「直接前往 Google Maps 留下公開評論」的連結，保障消費者的自由選擇權，完全符合台灣《公平交易法》第 21、25 條與 Google Maps 評論政策。",
  },
  {
    question: "Q：顧客給低分時，真的就不會去 Google 留負評了嗎？",
    answer:
      "透過提供溫馨私訊與 LINE 即時溝通管道，能在第一時間化解顧客的不滿情緒。絕大多數顧客在獲得店家積極處理後，便不會再去 Google 留一星負評。",
  },
  {
    question: "Q：如何整合 NovaOS 拓新雲端 帳號或管理多間分店？",
    answer:
      "本系統完美嵌入 NovaOS 拓新雲端 生態系，您可以為不同分店建立獨立的評分連結與 QR Code，方便統一管理與追蹤各門市的顧客回饋。",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700">
          <HelpCircle className="h-3.5 w-3.5 text-[#F59E0B]" />
          <span>常見問題 FAQ</span>
        </span>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
          關於 Nova商譽寶 的常見疑問
        </h2>
        <p className="mt-2.5 text-sm text-slate-600 sm:text-base">
          快速了解方案差異、LINE 串接方式與合規保障機制
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={item.question}
              className={`overflow-hidden rounded-2xl border bg-white transition ${
                isOpen
                  ? "border-amber-300 shadow-sm ring-1 ring-amber-200/50"
                  : "border-slate-200/80 shadow-sm hover:border-slate-300"
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${idx}`}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
              >
                <span className="text-sm font-bold text-[#0F172A] sm:text-base">
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[#F59E0B]" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  id={`faq-panel-${idx}`}
                  className="border-t border-slate-100 bg-[#FAF8F5]/60 px-5 py-4 text-sm leading-relaxed text-slate-600 sm:px-6"
                >
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
