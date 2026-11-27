"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import Reveal from "@/components/Reveal";

const cases = [
  {
    src: "/case-living.jpg",
    title: "小坪數客廳",
    caption: "暖色木質與簡潔線條，讓小空間顯得開闊明亮",
  },
  {
    src: "/case-entry.jpg",
    title: "玄關設計",
    caption: "鞋架與格柵分隔，兼顧收納機能與動線引導",
  },
];

export default function Cases() {
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
    <section id="cases" className="section-pad">
      <div className="section-shell">
        <Reveal>
          <div className="max-w-2xl">
            <p className="eyebrow">實際改造案例</p>
            <h2 className="headline mt-3 text-[clamp(1.85rem,4vw,2.75rem)]">
              真實空間，看得見的改變
            </h2>
            <p className="mt-4 text-base leading-7 text-ink-muted md:text-lg">
              精選已完成的客廳與玄關改造，呈現軟裝落地後的實際效果。
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 md:gap-6">
          {cases.map((item, index) => (
            <Reveal key={item.src} delayMs={index * 60}>
              <button
                type="button"
                className="group relative aspect-[4/3] w-full overflow-hidden rounded-[1.35rem] text-left"
                onClick={() =>
                  setLightbox({
                    src: item.src,
                    title: item.title,
                    caption: item.caption,
                  })
                }
                aria-label={`放大查看：${item.title}`}
              >
                <Image
                  src={item.src}
                  alt={`${item.title}｜${item.caption}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={80}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 via-ink/30 to-transparent p-5 pt-20 text-white">
                  <span className="font-display block text-xl font-semibold tracking-tight">
                    {item.title}
                  </span>
                  <span className="mt-1.5 block text-sm leading-6 text-white/88">
                    {item.caption}
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
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-5 py-4 text-white">
              <p className="font-display text-lg font-semibold">{lightbox.title}</p>
              <p className="mt-1 text-sm text-white/85">{lightbox.caption}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
