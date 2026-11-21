import { ShieldCheck, Zap, Workflow } from "lucide-react";
import { WHY_CHOOSE_US } from "@/lib/product-ecosystem";

const ICONS = [ShieldCheck, Zap, Workflow] as const;

export function WhyChooseUs() {
  return (
    <section id="why-us" className="relative scroll-mt-24 border-y border-white/5 py-20 sm:py-28">
      <div
        className="absolute inset-0 -z-10 opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(34,211,238,0.08), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-amber-300/90">
            WHY CHOOSE US
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            企業優勢與技術背書
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
            我們把雲端工程能力做成可落地的產品，讓小團隊也能用上穩定、安全、可自動化的營運基礎。
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {WHY_CHOOSE_US.map((item, index) => {
            const Icon = ICONS[index] ?? ShieldCheck;
            return (
              <div key={item.title} className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display mt-5 text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
