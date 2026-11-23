import Link from "next/link";
import { Sparkles, Timer } from "lucide-react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

export default function Hero() {
  return (
    <section id="hero" className="section-pad pt-28 md:pt-32">
      <div className="section-shell grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="reveal">
          <p className="eyebrow">
            <Timer size={14} aria-hidden />
            30 秒 AI 軟裝改造
          </p>
          <h1 className="headline mt-4 text-[clamp(2rem,5.2vw,3.35rem)] text-ink">
            上傳房間照片，30 秒用 AI 打造你的理想空間
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-ink-muted md:text-lg">
            讓 AI 幫你做精準動線規劃、採光分析與 3D 軟裝擬真渲染。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="#studio" className="btn btn-primary">
              <Sparkles size={16} aria-hidden />
              上傳照片 ‧ 免費體驗 1 次
            </Link>
            <Link href="#pricing" className="btn btn-secondary">
              查看方案與收費
            </Link>
          </div>
          <p className="mt-5 text-sm text-ink-muted">
            拓維空間 · 附屬於拓新雲端 · 註冊即送 1 次 Credit
          </p>
        </div>

        <div className="reveal reveal-delay-1">
          <BeforeAfterSlider
            beforeSrc="/gallery-1.jpg"
            afterSrc="/case-living.jpg"
            beforeLabel="改造前"
            afterLabel="AI 擬真"
          />
          <p className="mt-3 text-center text-xs tracking-wide text-ink-muted">
            拖曳滑塊比較 Before / After
          </p>
        </div>
      </div>
    </section>
  );
}
