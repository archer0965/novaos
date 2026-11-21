"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import {
  Upload,
  Sparkles,
  Loader2,
  ImageIcon,
  SunMedium,
  Route,
  Download,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import {
  AI_STYLES,
  ROOM_TYPES,
  type AiStyleId,
  type RoomTypeId,
} from "@/lib/constants";

type Analysis = {
  styleLabel: string;
  roomLabel?: string;
  flow: string;
  lighting: string;
  palette: string[];
  suggestions: string[];
  renderNote: string;
};

type GenerateResult = {
  ok: boolean;
  previewMode?: boolean;
  outputUrl?: string;
  resultImageUrl?: string;
  analysis?: Analysis;
  message?: string;
  error?: string;
  code?: string;
  credits?: { remaining: number; subscriptionEndsAt: string | null };
};

function getOrCreateAccountId() {
  const key = "nd_account_id";
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = `u_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    localStorage.setItem(key, id);
    return id;
  } catch {
    return "guest";
  }
}

function mapErrorMessage(status: number, data: GenerateResult): string {
  if (data.code === "NO_CREDIT" || status === 402) {
    return data.error || "Credit 不足，請至方案區購買後再試";
  }
  if (data.code === "IMAGE_TOO_LARGE") {
    return "圖片過大，請壓縮至 8MB 以下再上傳";
  }
  if (data.code === "NO_FAL_KEY") {
    return data.error || "伺服器尚未設定 FAL_KEY，暫時無法真實生成";
  }
  if (data.code === "FAL_TIMEOUT" || status === 504) {
    return "AI 生成逾時，請稍後再試一次";
  }
  if (status >= 500) {
    return data.error || "伺服器忙碌中，請稍後再試";
  }
  return data.error || "生成失敗，請稍後再試";
}

export default function AiStudio() {
  const inputId = useId();
  const [style, setStyle] = useState<AiStyleId>("cream-jp");
  const [roomType, setRoomType] = useState<RoomTypeId>("living");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("nd_free_credits");
    if (stored == null) {
      localStorage.setItem("nd_free_credits", "1");
      setCreditsLeft(1);
    } else {
      setCreditsLeft(Number(stored));
    }
  }, []);

  function onPickFile(next: File | null) {
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      setError("請上傳圖片檔（JPG / PNG / WEBP）");
      return;
    }
    if (next.size > 8 * 1024 * 1024) {
      setError("圖片過大，請壓縮至 8MB 以下再上傳");
      return;
    }
    setError(null);
    setResult(null);
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }

  async function handleGenerate() {
    if (!file) {
      setError("請先上傳房間照片");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.set("image", file);
      form.set("style", style);
      form.set("roomType", roomType);
      form.set("accountId", getOrCreateAccountId());

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 120_000);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      window.clearTimeout(timeout);

      const data = (await res.json()) as GenerateResult;

      if (!res.ok || !data.ok) {
        setError(mapErrorMessage(res.status, data));
        if (data.code === "NO_CREDIT") {
          setCreditsLeft(0);
          localStorage.setItem("nd_free_credits", "0");
        }
        return;
      }

      setResult(data);
      if (typeof data.credits?.remaining === "number") {
        setCreditsLeft(data.credits.remaining);
        localStorage.setItem(
          "nd_free_credits",
          String(data.credits.remaining),
        );
      } else {
        const next = Math.max(0, (creditsLeft ?? 1) - 1);
        setCreditsLeft(next);
        localStorage.setItem("nd_free_credits", String(next));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("AI 生成逾時（超過 2 分鐘），請稍後再試");
      } else {
        setError("連線失敗，請檢查網路後再試");
      }
    } finally {
      setLoading(false);
    }
  }

  const outputUrl = result?.outputUrl || result?.resultImageUrl || null;

  async function handleDownload() {
    if (!outputUrl) return;
    try {
      const res = await fetch(outputUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `novadimension-${style}-${roomType}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(outputUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <section id="studio" className="section-pad bg-[rgba(247,241,232,0.55)]">
      <div className="section-shell">
        <Reveal>
          <div className="max-w-2xl">
            <p className="eyebrow">AI 實時生成體驗</p>
            <h2 className="headline mt-3 text-[clamp(1.75rem,4vw,2.6rem)]">
              上傳照片，選擇風格，立刻產出擬真圖
            </h2>
            <p className="mt-4 text-base leading-7 text-ink-muted md:text-lg">
              串接 fal.ai
              結構保留生成：動線／採光分析 + 軟裝擬真渲染。免費體驗含 1 次
              Credit。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <div className="soft-panel p-5 md:p-7">
              <label
                htmlFor={inputId}
                className="flex cursor-pointer flex-col items-center justify-center rounded-[1.2rem] border border-dashed border-[rgba(166,124,93,0.35)] bg-[rgba(253,251,247,0.7)] px-4 py-10 text-center transition-colors hover:border-accent/60 hover:bg-white"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onPickFile(e.dataTransfer.files?.[0] ?? null);
                }}
              >
                {preview ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1rem]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="上傳預覽"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <>
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                      <Upload size={24} aria-hidden />
                    </span>
                    <p className="mt-4 font-display text-lg font-semibold">
                      拖曳或點擊上傳房間照片
                    </p>
                    <p className="mt-2 text-sm text-ink-muted">
                      支援 JPG / PNG / WEBP，最大 8MB
                    </p>
                  </>
                )}
                <input
                  id={inputId}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />
              </label>

              <div className="mt-6">
                <p className="form-label">空間類型</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ROOM_TYPES.map((item) => {
                    const active = roomType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRoomType(item.id)}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "border-accent bg-accent-soft text-ink"
                            : "border-line bg-ivory text-ink-muted hover:border-accent/40 hover:text-ink"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <p className="form-label">風格選擇</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {AI_STYLES.map((item) => {
                    const active = style === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setStyle(item.id)}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "border-accent bg-accent-soft text-ink"
                            : "border-line bg-ivory text-ink-muted hover:border-accent/40 hover:text-ink"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink-muted">
                  剩餘 Credit：{" "}
                  <span className="font-semibold text-ink">
                    {creditsLeft ?? "—"}
                  </span>
                </p>
                <button
                  type="button"
                  className="btn btn-primary w-full sm:w-auto"
                  disabled={loading}
                  onClick={handleGenerate}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden />
                      生成中…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} aria-hidden />
                      立即生成 3D 擬真圖 (消耗 1 次 Credit)
                    </>
                  )}
                </button>
              </div>

              {loading ? (
                <p
                  className="mt-4 rounded-xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm text-ink"
                  role="status"
                  aria-live="polite"
                >
                  AI 正在分析空間與渲染軟裝中…
                </p>
              ) : null}

              {error ? (
                <p className="mt-4 rounded-xl border border-[rgba(180,80,60,0.25)] bg-[rgba(180,80,60,0.08)] px-4 py-3 text-sm text-[#8a3d2f]">
                  {error}
                  {error.includes("Credit") || error.includes("方案") ? (
                    <>
                      {" "}
                      <a href="#pricing" className="font-semibold underline">
                        前往方案收費
                      </a>
                    </>
                  ) : null}
                </p>
              ) : null}
            </div>
          </Reveal>

          <Reveal delayMs={80}>
            <div className="soft-panel flex h-full flex-col p-5 md:p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="form-label mb-0">成果展示</p>
                {outputUrl ? (
                  <button
                    type="button"
                    className="btn btn-secondary min-h-10 px-3 text-sm"
                    onClick={handleDownload}
                  >
                    <Download size={15} aria-hidden />
                    下載圖片
                  </button>
                ) : null}
              </div>

              {loading ? (
                <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-[1.15rem] border border-dashed border-accent/30 bg-[rgba(253,251,247,0.7)] px-6 py-16 text-center">
                  <Loader2
                    size={28}
                    className="animate-spin text-accent"
                    aria-hidden
                  />
                  <p className="mt-4 font-display text-lg font-semibold">
                    AI 正在分析空間與渲染軟裝中…
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">
                    通常約 30 秒，請稍候
                  </p>
                </div>
              ) : result && outputUrl ? (
                <div className="mt-4 flex flex-1 flex-col gap-5">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.15rem] bg-cream">
                    <Image
                      src={outputUrl}
                      alt="AI 擬真成果"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      unoptimized={outputUrl.startsWith("http")}
                    />
                  </div>
                  {result.message ? (
                    <p className="text-sm text-ink-muted">{result.message}</p>
                  ) : null}

                  {result.analysis ? (
                    <div className="rounded-[1.15rem] border border-line bg-[rgba(253,251,247,0.9)] p-4 md:p-5">
                      <h3 className="font-display text-lg font-semibold">
                        AI 空間分析報告
                      </h3>
                      <p className="mt-1 text-sm text-ink-muted">
                        風格：{result.analysis.styleLabel}
                        {result.analysis.roomLabel
                          ? ` · 空間：${result.analysis.roomLabel}`
                          : null}
                      </p>
                      <ul className="mt-4 space-y-3 text-sm leading-6 text-ink">
                        <li className="flex gap-2">
                          <Route
                            size={16}
                            className="mt-1 shrink-0 text-accent"
                            aria-hidden
                          />
                          <span>
                            <strong>動線：</strong>
                            {result.analysis.flow}
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <SunMedium
                            size={16}
                            className="mt-1 shrink-0 text-accent"
                            aria-hidden
                          />
                          <span>
                            <strong>採光：</strong>
                            {result.analysis.lighting}
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <ImageIcon
                            size={16}
                            className="mt-1 shrink-0 text-accent"
                            aria-hidden
                          />
                          <span>
                            <strong>擬真說明：</strong>
                            {result.analysis.renderNote}
                          </span>
                        </li>
                      </ul>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {result.analysis.palette.map((color) => (
                          <span
                            key={color}
                            className="inline-flex items-center gap-2 rounded-full border border-line bg-ivory px-2.5 py-1 text-xs text-ink-muted"
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-line"
                              style={{ background: color }}
                            />
                            {color}
                          </span>
                        ))}
                      </div>
                      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink-muted">
                        {result.analysis.suggestions.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-[1.15rem] border border-dashed border-line bg-[rgba(253,251,247,0.55)] px-6 py-16 text-center">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                    <Sparkles size={24} aria-hidden />
                  </span>
                  <p className="mt-4 font-display text-lg font-semibold">
                    生成結果會顯示在這裡
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">
                    上傳照片並選擇空間／風格後，即可獲得擬真圖與 AI
                    空間分析報告。
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
