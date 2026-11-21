import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function ContactCta() {
  return (
    <section id="contact" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950 to-[#05070f] px-6 py-12 sm:px-10 sm:py-16">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl"
            aria-hidden
          />

          <div className="relative max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.18em] text-cyan-300/90">
              CONTACT
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              商務合作與產品諮詢
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
              想導入拓新雲端產品矩陣、客製整合，或需要售後支援？直接聯絡我們，我們會以商業合作節奏回覆。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${siteConfig.supportEmail}?subject=${encodeURIComponent("拓新雲端商務合作諮詢")}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
              >
                <Mail className="h-4 w-4" />
                Email 諮詢
              </a>
              <a
                href={siteConfig.lineOfficialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4 text-emerald-300" />
                LINE 客服
              </a>
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-transparent px-5 text-sm font-semibold text-cyan-200 underline-offset-4 hover:underline"
              >
                或先免費註冊試用 →
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              {siteConfig.supportEmail} · {siteConfig.companyAddress}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
