"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

type MockupScene = "positive" | "line-rescue";

export function HeroPhoneMockup() {
  const [scene, setScene] = useState<MockupScene>("line-rescue");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setScene((prev) => (prev === "line-rescue" ? "positive" : "line-rescue"));
    }, 5200);
    return () => window.clearInterval(timer);
  }, [paused]);

  function handleSelectScene(next: MockupScene) {
    setPaused(true);
    setScene(next);
  }

  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 rounded-[3rem] bg-gradient-to-tr from-amber-200/45 via-amber-100/20 to-emerald-200/35 blur-2xl"
      />

      {/* Interactive Scenario Switcher */}
      <div className="relative z-10 mb-3 flex items-center justify-center">
        <div className="inline-flex rounded-xl border border-slate-200/90 bg-white/95 p-1 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            onClick={() => handleSelectScene("positive")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              scene === "positive"
                ? "bg-[#0F172A] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            <span>4–5 星 → Google 好評</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectScene("line-rescue")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              scene === "line-rescue"
                ? "bg-[#06C755] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>1–3 星 → LINE 攔截</span>
          </button>
        </div>
      </div>

      {/* Phone Frame */}
      <div className="relative z-10 overflow-hidden rounded-[2.6rem] border-[7px] border-[#0F172A] bg-slate-50 shadow-2xl">
        {/* Status Bar & Dynamic Island */}
        <div className="flex items-center justify-between bg-white px-6 pt-3 pb-2 text-[11px] font-bold text-slate-800">
          <span>09:41</span>
          <div className="h-5 w-24 rounded-full bg-[#0F172A]" />
          <span className="text-[10px] text-slate-500">5G</span>
        </div>

        {/* Screen Body */}
        <div className="min-h-[470px] bg-gradient-to-b from-amber-50/40 via-[#FAF8F5] to-slate-100/70 p-4">
          {/* Store Mini Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/novashield/logo-sunwood.svg"
                alt="山木日和咖啡廳 Logo"
                className="h-11 w-11 rounded-xl border border-slate-100 object-cover"
              />
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-extrabold text-[#0F172A]">
                  山木日和咖啡廳・大安店
                </p>
                <p className="text-[11px] text-slate-500">
                  掃碼完成體驗評分・只需 15 秒
                </p>
              </div>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200/70">
                {scene === "positive" ? "平均 5★" : "平均 2★"}
              </span>
            </div>

            {/* Multi-dimensional Stars */}
            <div className="mt-3.5 space-y-2 rounded-xl bg-slate-50/90 p-3">
              {[
                {
                  label: "餐點品質",
                  score: scene === "positive" ? 5 : 3,
                },
                {
                  label: "服務態度",
                  score: scene === "positive" ? 5 : 2,
                },
                {
                  label: "環境衛生",
                  score: scene === "positive" ? 5 : 2,
                },
              ].map((dim) => (
                <div
                  key={dim.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-700">
                    {dim.label}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-4 w-4 transition-all duration-300 ${
                          n <= dim.score
                            ? "fill-[#F59E0B] text-[#F59E0B]"
                            : "fill-transparent text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Outcome Panel */}
          {scene === "positive" ? (
            <div className="mt-3 rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50/90 to-white p-4 text-center shadow-sm transition-all">
              <div className="mx-auto mb-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                <Sparkles className="h-3 w-3" />
                <span>感謝 5 星好評肯定！</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                邀請您花 10 秒將這份美好體驗分享到 Google Maps，幫助更多朋友找到我們。
              </p>
              <div className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#F59E0B] px-4 py-2.5 text-xs font-bold text-white shadow-sm">
                <Star className="h-3.5 w-3.5 fill-white" />
                <span>前往 Google Maps 留下 5 星評論</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
              <div className="mt-2.5 flex items-center justify-center gap-1 text-[10px] font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                <span>一鍵直達 Google 商家評論頁，提升轉化率</span>
              </div>
            </div>
          ) : (
            <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-200/90 bg-white shadow-sm transition-all">
              {/* Simulated LINE Chat Header */}
              <div className="flex items-center justify-between bg-[#06C755] px-3.5 py-2 text-white">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <MessageSquare className="h-3.5 w-3.5 fill-white/25" />
                  <span>LINE 私訊店長 (@shop123)</span>
                </div>
                <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[9px]">
                  Deep Link
                </span>
              </div>

              {/* Simulated Chat Bubbles */}
              <div className="space-y-2.5 bg-[#8CABD9]/20 p-3 text-left">
                {/* Customer Prefilled Bubble */}
                <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-[#8DE055] px-3 py-2 text-[11px] leading-relaxed text-slate-900 shadow-sm">
                  <p className="font-bold">【山木日和咖啡廳 顧客體驗回饋】</p>
                  <p>綜合評分：★★☆☆☆ 2 星</p>
                  <p>改善建議：今日尖峰候餐超過 20 分鐘，希望能協助確認出餐順序。</p>
                </div>

                {/* Store Manager Instant Reply */}
                <div className="mr-auto max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[11px] leading-relaxed text-slate-700 shadow-sm">
                  <p className="font-bold text-[#0F172A]">店長即時回覆：</p>
                  <p>非常抱歉讓您久等了！我們已立即優先處理您的餐點，並致贈今日手沖招待券致意。</p>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Micro-footer inside Mockup */}
          <p className="mt-3 flex items-center justify-center gap-1 text-center text-[10px] text-slate-400">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span>頁底常駐 Google Maps 公開評論連結・完全合規</span>
          </p>
        </div>
      </div>

      {/* Floating Metric Badges (Desktop) */}
      <div className="pointer-events-none absolute top-24 -left-10 z-20 hidden rounded-2xl border border-slate-200/80 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur-sm xl:block">
        <p className="text-[10px] font-semibold text-slate-400">
          LINE 原生喚起
        </p>
        <p className="text-xs font-extrabold text-[#06C755]">
          免 API Token・0 推播費
        </p>
      </div>

      <div className="pointer-events-none absolute -right-8 bottom-16 z-20 hidden rounded-2xl border border-amber-200/80 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur-sm xl:block">
        <p className="text-[10px] font-semibold text-slate-400">
          Google 商家口碑
        </p>
        <p className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0F172A]">
          <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
          <span>穩健累積 5 星好評</span>
        </p>
      </div>
    </div>
  );
}
