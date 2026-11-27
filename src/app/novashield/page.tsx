import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  ExternalLink,
  MessageSquare,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { LandingNavbar } from "@/components/novashield/landing/LandingNavbar";
import { HeroPhoneMockup } from "@/components/novashield/landing/HeroPhoneMockup";
import { LandingPricing } from "@/components/novashield/landing/LandingPricing";
import { FaqAccordion } from "@/components/novashield/landing/FaqAccordion";
import { MerchantTermsSection } from "@/components/novashield/legal/MerchantTermsSection";

import { PRODUCTION_URL } from "@/lib/site";

const OG_IMAGE_URL = "/og-novashield.png?v=20261127";
const PAGE_TITLE = "Nova商譽寶（NovaShield）｜門市 5 星商譽的第一道防線";
const PAGE_DESC =
  "讓滿意好評順暢引導至 Google Maps，讓負評客訴在 LINE 私訊溫柔解決。內建顧客回饋數據儀表板、自訂 QR Code 立牌與 AI 客訴回覆大師，免費版 $0 立即體驗。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESC,
  alternates: {
    canonical: "/novashield",
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: `${PRODUCTION_URL}/novashield`,
    siteName: "拓新雲端 NovaOS",
    title: PAGE_TITLE,
    description: PAGE_DESC,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Nova商譽寶（NovaShield）— 門市 5 星商譽的第一道防線",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESC,
    images: [OG_IMAGE_URL],
  },
};

const FEATURES = [
  {
    icon: Star,
    badge: "好評成長引擎",
    iconWrapClass: "bg-amber-50 text-[#F59E0B] ring-1 ring-amber-200/70",
    title: "好評自動引導",
    description:
      "4-5 星滿意顧客一鍵跳轉至 Google Maps，快速累積高分口碑。",
  },
  {
    icon: MessageSquare,
    badge: "零 API 門檻",
    iconWrapClass: "bg-[#06C755]/10 text-[#06C755] ring-1 ring-[#06C755]/25",
    title: "LINE 即時私訊攔截",
    description:
      "1-3 星不滿意顧客直接喚起 LINE 與店家一對一溝通，離店前搞定客訴。",
  },
  {
    icon: ShieldCheck,
    badge: "合規透明機制",
    iconWrapClass: "bg-slate-100 text-[#0F172A] ring-1 ring-slate-200",
    title: "完全合規透明",
    description:
      "預設保留公開評論連結，符合台灣《公平交易法》與 Google 平台規範。",
  },
];

const DEMO_LINKS = [
  {
    href: "/novashield/feedback/bistro88",
    badge: "專業版效果展示",
    badgeClass: "bg-[#0F172A] text-amber-300",
    title: "暮光義式餐酒館・信義旗艦",
    detail: "多維度評分 × 品牌主題色 × LINE @bistro88 私訊跳轉",
  },
  {
    href: "/novashield/feedback/shop123",
    badge: "免費版 C 端體驗",
    badgeClass: "bg-slate-200 text-slate-700",
    title: "山木日和咖啡廳・大安店",
    detail: "單一總體星等 × Email 客訴通知（升級後解鎖多維度與 LINE）",
  },
  {
    href: "/novashield/feedback/shop-free",
    badge: "免費版 C 端體驗",
    badgeClass: "bg-slate-200 text-slate-700",
    title: "暖暖手作早餐店",
    detail: "單一總體星等 × Email 客訴通知（無 LINE 跳轉）",
  },
];

export default function NovaShieldHomePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F172A]">
      <LandingNavbar />

      <main>
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-white via-[#FAF8F5] to-[#FAF8F5]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-24">
            <div className="text-center lg:col-span-7 lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/90 px-3.5 py-1.5 text-xs font-bold text-amber-800 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span>NovaOS 拓新雲端 旗下微服務・Nova商譽寶 (NovaShield)</span>
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.15]">
                門市{" "}
                <span className="relative inline-block text-[#F59E0B]">
                  5 星商譽
                </span>
                的第一道防線
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0">
                讓滿意好評順暢引導至 Google Maps，讓負評客訴在 LINE
                私訊溫柔解決。
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row lg:justify-start">
                <Link
                  href="/novashield/admin"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0F172A] px-7 py-4 text-sm font-extrabold text-white shadow-md transition hover:bg-slate-800 active:scale-[0.99] sm:w-auto sm:text-base"
                >
                  <span>免費體驗 ($0)</span>
                  <ArrowRight className="h-4 w-4 text-[#F59E0B]" />
                </Link>

                <Link
                  href="/novashield/admin?shop=shop123#upgrade"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#F59E0B] bg-white px-7 py-4 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-amber-50 active:scale-[0.99] sm:w-auto sm:text-base"
                >
                  <Crown className="h-4 w-4 text-[#F59E0B]" />
                  <span>升級專業版 ($199/月)</span>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs font-semibold text-slate-500 lg:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                  免安裝 App・掃碼 15 秒完成
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-[#06C755]" />
                  原生 LINE Deep Link 零推播費
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  符合公平交易法與 Google 規範
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <HeroPhoneMockup />
            </div>
          </div>
        </section>

        {/* 2. Core Features Section */}
        <section id="features" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                <Shield className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span>核心痛點與特色解法</span>
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                專為實體門市打造的口碑守護流程
              </h2>
              <p className="mt-2.5 text-sm text-slate-600 sm:text-base">
                三步建立正向評論循環，把沉默的好評變成公開星等，把突發客訴留在離店前化解。
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="group rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feat.iconWrapClass}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200/70">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-extrabold text-[#0F172A]">
                      {feat.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                      {feat.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Interactive Live Demo Bar */}
            <div className="mt-12 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    立即試玩示範門市（C 端顧客視角）
                  </h3>
                  <p className="text-xs text-slate-500 sm:text-sm">
                    點擊下方示範門市，親身體驗免費版 Email 表單與專業版 LINE 即時私訊跳轉差異
                  </p>
                </div>
                <Link
                  href="/novashield/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 sm:text-sm"
                >
                  <span>或前往 B 端後台自訂門市</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                {DEMO_LINKS.map((demo) => (
                  <Link
                    key={demo.href}
                    href={demo.href}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-[#FAF8F5]/70 p-4 transition hover:border-[#F59E0B] hover:bg-amber-50/40"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${demo.badgeClass}`}
                        >
                          {demo.badge}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-[#F59E0B]" />
                      </div>
                      <p className="mt-2 text-sm font-bold text-[#0F172A]">
                        {demo.title}
                      </p>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">{demo.detail}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Pricing Section */}
        <section
          id="pricing"
          className="scroll-mt-20 border-t border-slate-200/70 bg-white py-16 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <LandingPricing />
          </div>
        </section>

        {/* 4. FAQ Section */}
        <section
          id="faq"
          className="scroll-mt-20 border-t border-slate-200/70 bg-[#FAF8F5] py-16 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FaqAccordion />
          </div>
        </section>

        {/* 5. Compliance & Terms Section */}
        <section
          id="compliance"
          className="scroll-mt-20 border-t border-slate-200/70 bg-white py-12 sm:py-16"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <MerchantTermsSection />
          </div>
        </section>
      </main>

      {/* 6. Dark Footer */}
      <footer className="bg-[#0F172A] text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#F59E0B]">
                <Shield className="h-5 w-5 fill-[#F59E0B]/20" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  NovaOS 拓新雲端
                </p>
                <p className="text-base font-extrabold text-white">
                  Nova商譽寶{" "}
                  <span className="font-semibold text-[#F59E0B]">
                    (NovaShield)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-300 sm:text-sm">
              <a href="#features" className="transition hover:text-white">
                產品特色
              </a>
              <a href="#pricing" className="transition hover:text-white">
                方案定價
              </a>
              <a href="#faq" className="transition hover:text-white">
                常見問題 FAQ
              </a>
              <a href="#compliance" className="transition hover:text-white">
                合規聲明
              </a>
              <Link
                href="/novashield/admin"
                className="text-[#F59E0B] hover:text-amber-300"
              >
                進入店家後台
              </Link>
              <Link href="/" className="transition hover:text-white">
                返回拓新雲端 NovaOS 主頁
              </Link>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <p className="text-xs leading-relaxed text-slate-400">
              本系統係由 NovaOS 拓新雲端
              提供之門市顧客滿意度調查與客服輔助工具。本系統預設保留消費者公開評論權利，符合台灣《公平交易法》第
              21 條、第 25 條及 Google Maps
              商家評論政策。店家使用本服務時應恪遵合規經營原則，不得進行虛偽評論或強制干涉消費者表達權利。
            </p>
            <p className="text-xs font-medium text-slate-500">
              © 2026 NovaOS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
