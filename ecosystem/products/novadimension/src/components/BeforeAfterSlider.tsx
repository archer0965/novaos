"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
};

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before",
  afterLabel = "After",
  className = "",
}: Props) {
  const [pos, setPos] = useState(52);
  const dragging = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(96, Math.max(4, next)));
  }, []);

  return (
    <div
      ref={trackRef}
      className={`relative aspect-[16/10] w-full touch-none overflow-hidden rounded-[1.35rem] bg-cream shadow-[var(--shadow-soft)] select-none ${className}`}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        updateFromClientX(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      role="slider"
      aria-label="Before After 對比滑塊"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPos((p) => Math.max(4, p - 4));
        if (e.key === "ArrowRight") setPos((p) => Math.min(96, p + 4));
      }}
    >
      <Image
        src={afterSrc}
        alt="改造後空間"
        fill
        sizes="(max-width: 768px) 100vw, 560px"
        className="object-cover"
        priority
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <Image
          src={beforeSrc}
          alt="改造前空間"
          fill
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-cover"
          priority
        />
      </div>

      <div
        className="absolute inset-y-0 z-10 w-0.5 bg-white/90 shadow-[0_0_0_1px_rgba(44,42,40,0.12)]"
        style={{ left: `${pos}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-[rgba(253,251,247,0.95)] text-ink shadow-[var(--shadow-card)]">
          <span className="text-xs font-semibold tracking-wide">⇄</span>
        </span>
      </div>

      <span className="absolute top-3 left-3 rounded-full bg-[rgba(44,42,40,0.55)] px-3 py-1 text-[0.7rem] font-semibold tracking-wider text-white uppercase backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-3 rounded-full bg-[rgba(166,124,93,0.85)] px-3 py-1 text-[0.7rem] font-semibold tracking-wider text-white uppercase backdrop-blur-sm">
        {afterLabel}
      </span>
    </div>
  );
}
