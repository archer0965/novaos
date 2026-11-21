"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function BrandHero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      {/* Full-bleed atmosphere */}
      <div className="absolute inset-0 -z-10 bg-[#05070f]" aria-hidden />
      <div
        className="absolute inset-0 -z-10 opacity-90"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 10%, rgba(34,211,238,0.18), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 20%, rgba(251,191,36,0.12), transparent 50%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(56,189,248,0.10), transparent 60%)",
        }}
      />
      <div
        className="hero-grid-fade absolute inset-0 -z-10 opacity-[0.35]"
        aria-hidden
      />
      <div
        className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl motion-safe:animate-pulse"
        aria-hidden
      />
      <div
        className="absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl motion-safe:animate-[pulse_5s_ease-in-out_infinite]"
        aria-hidden
      />

      {/* Dominant visual plane — product constellation */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] lg:block"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#05070f]/20 to-[#05070f]/90" />
        <HeroConstellation />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="motion-safe:animate-fade-up">
          <BrandLogo size="lg" href="/" variant="light" />
        </div>

        <h1 className="font-display motion-safe:animate-fade-up delay-100 mt-5 max-w-2xl text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]">
          把繁瑣營運
          <span className="mt-1 block bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-200 bg-clip-text text-transparent">
            變成可成長的雲端系統
          </span>
        </h1>

        <p className="motion-safe:animate-fade-up delay-200 mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
          NovaStore、拓脈預約、Nova AI Doc、訂閱管家與拓維空間——專業雲端工具，幫微型團隊用企業級穩定度擴張。
        </p>

        <div className="motion-safe:animate-fade-up delay-300 mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="#products"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-6 text-sm font-semibold text-slate-950 shadow-[0_0_40px_-12px_rgba(34,211,238,0.7)] transition hover:brightness-110"
          >
            探索產品矩陣
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur transition hover:border-cyan-300/40 hover:bg-white/10"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            免費開始
          </Link>
        </div>

        {/* Mobile visual */}
        <div
          className="motion-safe:animate-fade-up delay-300 relative mt-14 h-48 sm:h-56 lg:hidden"
          aria-hidden
        >
          <HeroConstellation compact />
        </div>
      </div>
    </section>
  );
}

function HeroConstellation({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 640 720"
      className={
        compact
          ? "h-full w-full object-contain opacity-90"
          : "absolute right-0 top-1/2 h-[78%] w-auto -translate-y-1/2 opacity-95"
      }
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="拓新雲端產品矩陣示意"
    >
      <defs>
        <linearGradient id="panel" x1="80" y1="40" x2="520" y2="680">
          <stop stopColor="#0f172a" />
          <stop offset="1" stopColor="#111827" />
        </linearGradient>
        <linearGradient id="line" x1="140" y1="120" x2="460" y2="520">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="18"
            stdDeviation="22"
            floodColor="#22d3ee"
            floodOpacity="0.28"
          />
        </filter>
      </defs>
      <g filter="url(#glow)">
        <rect
          x="110"
          y="90"
          width="360"
          height="480"
          rx="28"
          fill="url(#panel)"
          stroke="#1e293b"
        />
        <rect x="146" y="140" width="180" height="14" rx="7" fill="url(#line)" opacity="0.9" />
        <rect x="146" y="172" width="260" height="8" rx="4" fill="#334155" />
        <rect x="146" y="196" width="220" height="8" rx="4" fill="#1e293b" />
        <rect
          x="146"
          y="250"
          width="288"
          height="96"
          rx="18"
          fill="#0b1220"
          stroke="#164e63"
        />
        <rect x="168" y="276" width="120" height="10" rx="5" fill="#22d3ee" opacity="0.75" />
        <rect x="168" y="300" width="200" height="8" rx="4" fill="#334155" />
        <rect
          x="146"
          y="370"
          width="288"
          height="96"
          rx="18"
          fill="#0b1220"
          stroke="#78350f"
        />
        <rect x="168" y="396" width="140" height="10" rx="5" fill="#fbbf24" opacity="0.8" />
        <rect x="168" y="420" width="180" height="8" rx="4" fill="#334155" />
      </g>
      <g className="motion-safe:animate-[float_6s_ease-in-out_infinite]">
        <rect
          x="430"
          y="230"
          width="150"
          height="120"
          rx="22"
          fill="#0b1220"
          stroke="#1e293b"
        />
        <circle cx="468" cy="270" r="12" fill="#22d3ee" />
        <rect x="492" y="262" width="66" height="8" rx="4" fill="#475569" />
        <rect x="452" y="300" width="106" height="8" rx="4" fill="#1e293b" />
        <rect x="452" y="320" width="86" height="8" rx="4" fill="#1e293b" />
      </g>
    </svg>
  );
}
