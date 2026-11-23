"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import Reveal from "@/components/Reveal";

const works = [
  {
    src: "/gallery-1.jpg",
    title: "暖調客廳",
    caption: "米白沙發 × 木質層次",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    src: "/gallery-2.jpg",
    title: "臥室角落",
    caption: "柔光床頭與織品堆疊",
    span: "",
  },
  {
    src: "/gallery-3.jpg",
    title: "閱讀角落",
    caption: "單椅、落地燈與植栽",
    span: "",
  },
  {
    src: "/gallery-4.jpg",
    title: "開放式客廳",
    caption: "低彩度家具配置",
    span: "md:col-span-1",
  },
  {
    src: "/gallery-5.jpg",
    title: "現代臥室",
    caption: "簡潔線條與質感布料",
    span: "",
  },
  {
    src: "/gallery-6.jpg",
    title: "日光客廳",
    caption: "自然光下的軟裝節奏",
    span: "md:col-span-2",
  },
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState<{
    src: string;
    title: string;
    caption: string;
  } | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightbox]);

  return (
    <section id="gallery" className="section-pad">
      <div className="section-shell">
        <Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">案例展示</p>
              <h2 className="headline mt-3 text-[clamp(1.85rem,4vw,2.75rem)]">
                房間與客廳的軟裝靈感
              </h2>
              <p className="mt-4 text-base leading-7 text-ink-muted md:text-lg">
                以 3D 模擬呈現風格方向與擺設節奏，點擊圖片可放大查看細節。
              </p>
            </div>
            <p className="text-sm tracking-[0.12em] text-ink-muted uppercase">
              Inspired by Home Planner
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid auto-rows-[220px] gap-4 md:grid-cols-3 md:auto-rows-[240px] md:gap-5">
          {works.map((work, index) => (
            <Reveal key={work.src} delayMs={index * 40}>
              <button
                type="button"
                className={`group relative h-full min-h-[220px] w-full overflow-hidden rounded-[1.35rem] text-left md:min-h-[240px] ${work.span}`}
                onClick={() =>
                  setLightbox({
                    src: work.src,
                    title: work.title,
                    caption: work.caption,
                  })
                }
                aria-label={`放大查看：${work.title}`}
              >
                <Image
                  src={work.src}
                  alt={`${work.title}｜${work.caption}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={75}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 via-ink/25 to-transparent p-5 pt-16 text-white">
                  <span className="font-display block text-lg font-semibold tracking-tight">
                    {work.title}
                  </span>
                  <span className="mt-1 block text-sm text-white/85">
                    {work.caption}
                  </span>
                </span>
                <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(255,250,245,0.9)] text-ink opacity-0 transition-opacity group-hover:opacity-100">
                  <ZoomIn size={16} aria-hidden />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {lightbox ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(28,31,36,0.72)] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white"
            aria-label="關閉預覽"
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>
          <div
            className="relative h-[min(78vh,720px)] w-full max-w-4xl overflow-hidden rounded-[1.35rem] bg-cream"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={lightbox.src}
              alt={`${lightbox.title}｜${lightbox.caption}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
