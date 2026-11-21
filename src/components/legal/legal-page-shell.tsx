import Link from "next/link";
import { LegalContactBlock } from "@/components/legal/legal-contact-block";
import { LegalDocNav } from "@/components/legal/legal-doc-nav";
import {
  LEGAL_COVERED_SERVICES,
  LEGAL_LAST_UPDATED,
  type LegalDocId,
} from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export function LegalPageShell({
  active,
  title,
  description,
  children,
}: {
  active: LegalDocId;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="space-y-8">
      <header className="space-y-4">
        <p className="text-xs font-semibold tracking-[0.16em] text-primary">
          LEGAL CENTER
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          最後更新日期：{LEGAL_LAST_UPDATED} · 適用於 {siteConfig.legalName}{" "}
          及其旗下工具與服務
        </p>
        <LegalDocNav active={active} />
      </header>

      <section className="rounded-2xl border border-border/70 bg-secondary/30 p-4 text-sm leading-relaxed text-muted-foreground sm:p-5">
        <p className="font-medium text-foreground">本文件涵蓋範圍</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          {LEGAL_COVERED_SERVICES.map((s) => (
            <li key={s.name}>
              <span className="text-foreground/90">{s.name}</span>
              <span className="text-muted-foreground"> — {s.note}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs">
          其他產品站如需統一條款，可連回總站{" "}
          <Link href="/legal" className="text-primary underline-offset-2 hover:underline">
            條款與法律中心
          </Link>
          。
        </p>
      </section>

      <div className="space-y-8">{children}</div>

      <LegalContactBlock />
    </article>
  );
}
