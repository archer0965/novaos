import { ArrowUpRight, Handshake, Megaphone } from "lucide-react";
import { siteConfig } from "@/lib/site";

const PROGRAMS = [
  {
    id: "partner-store",
    icon: Handshake,
    eyebrow: "PARTNER STORE",
    title: "特約店家",
    blurb:
      "適用 NovaStore 與拓脈預約（規則連動）。審核通過後：14 天試用，續約月繳 9 折／半年 82 折／年 75 折。不含訂閱管家（永久免費）與拓維空間。",
    cta: "LINE 申請特約店家",
  },
  {
    id: "ambassador",
    icon: Megaphone,
    eyebrow: "AMBASSADOR",
    title: "推廣大使",
    blurb:
      "適用 Nova AI Doc。審核通過後：14 天試用，續約月繳 9 折／半年 82 折／年 75 折。折扣以主站定價為準。",
    cta: "LINE 申請推廣大使",
  },
] as const;

/** Homepage subcategory: manual-review partner tracks → LINE CS */
export function PartnerPrograms() {
  return (
    <section id="partner" className="relative scroll-mt-24 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-emerald-300/90">
            PARTNERSHIP
          </p>
          <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            特約店家／推廣大使
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            此資格需人工審核，不在定價方案直接選購。請透過官方 LINE
            客服申請，通過後由管理員開通優惠。
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PROGRAMS.map((program) => {
            const Icon = program.icon;
            return (
              <article
                key={program.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-emerald-300/80">
                      {program.eyebrow}
                    </p>
                    <h3 className="font-display text-lg font-semibold text-white">
                      {program.title}
                    </h3>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {program.blurb}
                </p>
                <a
                  href={siteConfig.lineOfficialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/20"
                >
                  {program.cta}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
