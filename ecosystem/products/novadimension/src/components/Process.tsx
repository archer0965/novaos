import { Cuboid, Images, Lightbulb, PenLine } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: PenLine,
    title: "填寫需求",
    description: "告訴我們空間類型、風格偏好與生活習慣，建立專屬設計起點。",
  },
  {
    step: "02",
    icon: Cuboid,
    title: "3D 擬真設計",
    description: "以 Home Planner 呈現配置與氛圍，讓你先預覽理想空間樣貌。",
  },
  {
    step: "03",
    icon: Lightbulb,
    title: "靈感設計提案",
    description: "依需求整理風格方向與空間靈感，提出貼近你生活的軟裝構想。",
  },
  {
    step: "04",
    icon: Images,
    title: "回傳 2D／3D 設計圖",
    description: "交付對應的 2D、3D 設計圖，讓靈感清楚可見、方便後續參考。",
  },
];

export default function Process() {
  return (
    <section id="process" className="section-pad bg-[rgba(255,250,245,0.45)]">
      <div className="section-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">設計流程</p>
          <h2 className="headline mt-3 text-[clamp(1.85rem,4vw,2.75rem)]">
            四個步驟，從靈感到設計圖
          </h2>
          <p className="mt-4 text-base leading-7 text-ink-muted md:text-lg">
            以靈感設計為核心，回傳清楚的 2D、3D 圖面，讓理想空間先被看見。
          </p>
        </div>

        <ol className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.step} className="soft-panel p-6 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold tracking-[0.16em] text-accent">
                    {item.step}
                  </span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cream text-ink">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                </div>
                <h3 className="mt-8 font-display text-xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-ink-muted md:text-[0.95rem]">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
