"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Reveal from "@/components/Reveal";

const items = [
  {
    q: "免費體驗包含什麼？",
    a: "註冊／首次造訪可獲得 1 次 Credit，可用於生成擬真預覽與基礎空間分析。高清下載與完整報告可透過單次或訂閱方案解鎖。",
  },
  {
    q: "AI 生成需要多久？",
    a: "多數情況下約 30 秒內完成分析與擬真圖預覽。正式串接 Replicate／ControlNet 後，依算力佇列可能略有差異；尊榮方案享優先算力。",
  },
  {
    q: "如何付款？",
    a: "付費方案統一導向拓新雲端主站（paycheck.com.de）以綠界 ECPay 結帳，與 DocMate、NovaStore 同一帳號與金流。付款成功後由主站開通權益。",
  },
  {
    q: "會幫忙代購家具或施工嗎？",
    a: "不會。本平台專注 AI 軟裝靈感與空間分析，不含實體代購與硬裝工程。",
  },
  {
    q: "與拓新雲端的關係？",
    a: "拓維空間（NovaDimension）是獨立品牌網站，附屬於拓新雲端；金流與技術支援由拓新雲端統一提供，品牌名稱並不相同。",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section-pad bg-[rgba(247,241,232,0.45)]">
      <div className="section-shell max-w-3xl">
        <Reveal>
          <p className="eyebrow">常見問題</p>
          <h2 className="headline mt-3 text-[clamp(1.75rem,4vw,2.4rem)]">
            使用前你可以先了解
          </h2>
        </Reveal>

        <div className="mt-8 space-y-3">
          {items.map((item, index) => {
            const isOpen = open === index;
            return (
              <Reveal key={item.q} delayMs={index * 40}>
                <div className="soft-panel overflow-hidden">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : index)}
                  >
                    <span className="font-display text-base font-semibold md:text-lg">
                      {item.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-ink-muted transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </button>
                  {isOpen ? (
                    <p className="border-t border-line px-5 py-4 text-sm leading-7 text-ink-muted md:text-base">
                      {item.a}
                    </p>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
