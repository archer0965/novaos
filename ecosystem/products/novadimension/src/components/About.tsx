import Image from "next/image";
import Reveal from "@/components/Reveal";

export default function About() {
  return (
    <section id="about" className="section-pad">
      <div className="section-shell grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] md:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src="/gallery-6.jpg"
              alt="拓維空間靈感場景"
              fill
              sizes="(max-width: 1024px) 100vw, 48vw"
              quality={75}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 font-display text-sm tracking-[0.14em] text-white/90 uppercase">
              Soft Space · Clear Vision
            </p>
          </div>
        </Reveal>

        <Reveal delayMs={100}>
          <div>
            <p className="eyebrow">關於拓維空間</p>
            <h2 className="headline mt-3 text-[clamp(1.85rem,4vw,2.75rem)]">
              先看見理想空間，再決定怎麼生活
            </h2>
            <p className="mt-5 text-base leading-8 text-ink-muted md:text-lg">
              拓維空間NovaDimension
              專注以 Home Planner 進行軟裝與空間靈感提案。我們不做代購、不推銷單品，而是把風格、動線與氛圍，透過清楚的
              2D、3D 設計圖呈現出來。
            </p>
            <p className="mt-4 text-base leading-8 text-ink-muted md:text-lg">
              無論是小坪數臥室、客廳重整，或工作室角落，我們都希望你在動手前，就能篤定地看見「這就是我想要的感覺」。
            </p>

            <dl className="mt-8 grid gap-5 sm:grid-cols-3">
              {[
                { label: "服務核心", value: "靈感設計" },
                { label: "交付成果", value: "2D／3D 圖" },
                { label: "聯繫方式", value: "IG 私訊" },
              ].map((item) => (
                <div key={item.label} className="border-t border-line pt-4">
                  <dt className="text-xs tracking-[0.14em] text-ink-muted uppercase">
                    {item.label}
                  </dt>
                  <dd className="mt-2 font-display text-lg font-semibold tracking-tight text-ink">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
