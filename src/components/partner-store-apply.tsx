import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { EARLY_BIRD } from "@/types/database";

/** Compact header tag that jumps to the partnership section. */
export function PartnerStoreApplyTag() {
  return (
    <Link
      href="#partner"
      className="inline-flex items-center rounded-md border border-accent/40 bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent-foreground transition hover:bg-accent/25"
    >
      特約店家／推廣大使
    </Link>
  );
}

/** Landing section: pitch + LINE CTA + cooperation terms (manual review). */
export function PartnerStoreSection() {
  return (
    <section
      id="partner"
      className="relative z-10 scroll-mt-24 border-y border-border/70 bg-card/40 py-14 md:py-16"
    >
      <div className="mx-auto max-w-3xl px-4">
        <p className="text-sm font-medium text-primary">人工審核合作資格</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">
          特約店家／推廣大使
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
          此資格不在定價方案直接選購，需私訊官方 LINE 申請並經人工審核；通過後由管理員開通優惠。
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border/80 bg-background/50 p-4">
            <h3 className="font-display text-base font-semibold">
              {EARLY_BIRD.pitchTitle}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {EARLY_BIRD.pitch}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              通過後：{EARLY_BIRD.description}
            </p>
          </div>
        </div>

        <Link
          href={siteConfig.lineOfficialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          私訊官方 LINE 申請
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>

        <div className="mt-10 border-t border-border/80 pt-8">
          <h3 className="font-display text-lg font-semibold">
            {EARLY_BIRD.termsTitle}
          </h3>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
            {EARLY_BIRD.terms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
