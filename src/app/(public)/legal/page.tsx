import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LegalContactBlock } from "@/components/legal/legal-contact-block";
import { LegalDocNav } from "@/components/legal/legal-doc-nav";
import {
  LEGAL_COVERED_SERVICES,
  LEGAL_DOC_LINKS,
  LEGAL_LAST_UPDATED,
  LEGAL_PAYMENT_PROOF_NOTICE,
} from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "條款與法律中心",
  description:
    "拓新雲端 NovaOS 服務條款、隱私權政策、付費與退款政策、免責聲明總覽。",
};

export default function LegalIndexPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <p className="text-xs font-semibold tracking-[0.16em] text-primary">
          LEGAL CENTER
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          條款與法律中心
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          這裡彙整 {siteConfig.legalName}{" "}
          與旗下工具（NovaStore、拓脈預約、Nova AI Doc、拓維空間、訂閱管家
          等）之主要法律文件。請於使用服務前詳閱；註冊或繼續使用即表示您已閱讀並同意相關條款。
        </p>
        <p className="text-sm text-muted-foreground">
          最後更新日期：{LEGAL_LAST_UPDATED}
        </p>
        <LegalDocNav active="index" />
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {LEGAL_DOC_LINKS.map((doc) => (
          <Link
            key={doc.id}
            href={doc.href}
            className="group rounded-2xl border border-border/80 bg-card/70 p-5 transition hover:border-primary/40 hover:bg-card"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-foreground">
                {doc.title}
              </h2>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary"
                aria-hidden
              />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {doc.description}
            </p>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-border/70 bg-secondary/30 p-5">
        <h2 className="font-display text-lg font-semibold">涵蓋之服務與產品</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {LEGAL_COVERED_SERVICES.map((s) => (
            <li key={s.name}>
              <span className="text-foreground/90">{s.name}</span> — {s.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card/60 p-5">
        <h2 className="font-display text-lg font-semibold">付款憑證說明</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {LEGAL_PAYMENT_PROOF_NOTICE}
        </p>
      </section>

      <LegalContactBlock />
    </div>
  );
}
