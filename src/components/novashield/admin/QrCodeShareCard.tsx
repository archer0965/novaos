"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import {
  Building,
  Check,
  Copy,
  Download,
  ExternalLink,
  Palette,
  QrCode,
  Star,
} from "lucide-react";
import { PRODUCTION_URL as PRODUCTION_BASE_URL } from "@/lib/site";

interface QrCodeShareCardProps {
  shopId: string;
  shopName: string;
}

const FG_PRESETS = [
  { label: "NovaOS 深灰", hex: "#0F172A" },
  { label: "經典黑", hex: "#000000" },
  { label: "經典藍", hex: "#1D4ED8" },
  { label: "森木綠", hex: "#047857" },
];

const BG_PRESETS = [
  { label: "純白", hex: "#FFFFFF" },
  { label: "暖沙", hex: "#FAF8F5" },
  { label: "淡金", hex: "#FFFBEB" },
];

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function QrCodeShareCard({ shopId, shopName }: QrCodeShareCardProps) {
  const [urlMode, setUrlMode] = useState<"production" | "local">("production");
  const [localOrigin, setLocalOrigin] = useState(PRODUCTION_BASE_URL);
  const [copied, setCopied] = useState(false);

  // Customization options
  const [fgColor, setFgColor] = useState("#0F172A");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [showShopLabel, setShowShopLabel] = useState(true);
  const [promptText, setPromptText] = useState("掃描抽好禮 / 留下寶貴意見");

  // High-res offscreen QR canvas ref for crisp print downloads
  const exportQrHostRef = useRef<HTMLDivElement | null>(null);

  const feedbackPath = `/novashield/feedback/${encodeURIComponent(shopId)}`;
  const productionUrl = `${PRODUCTION_BASE_URL}${feedbackPath}`;
  const activeUrl =
    urlMode === "production" ? productionUrl : `${localOrigin}${feedbackPath}`;

  const cardTitle = `${shopName || "我的門市"} 專屬意見卡`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLocalOrigin(window.location.origin);
    }
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  function handleDownloadPng() {
    const sourceQrCanvas = exportQrHostRef.current?.querySelector("canvas");
    if (!sourceQrCanvas) return;

    const exportCanvas = document.createElement("canvas");
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    if (!showShopLabel) {
      // Clean standalone QR code PNG (800x800)
      exportCanvas.width = 800;
      exportCanvas.height = 800;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 800, 800);
      ctx.drawImage(sourceQrCanvas, 80, 80, 640, 640);
    } else {
      // Printable tabletop card PNG (900x1180) with header, custom QR, stars, and prompt
      const W = 900;
      const H = 1180;
      exportCanvas.width = W;
      exportCanvas.height = H;

      // Outer background
      ctx.fillStyle = "#FAF8F5";
      ctx.fillRect(0, 0, W, H);

      // Card container
      drawRoundedRect(ctx, 48, 48, W - 96, H - 96, 44);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#E2E8F0";
      ctx.stroke();

      // Top amber accent strip inside card
      ctx.save();
      drawRoundedRect(ctx, 48, 48, W - 96, H - 96, 44);
      ctx.clip();
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(48, 48, W - 96, 18);
      ctx.restore();

      // Brand pill
      ctx.fillStyle = "#FEF3C7";
      drawRoundedRect(ctx, W / 2 - 140, 102, 280, 44, 22);
      ctx.fill();
      ctx.fillStyle = "#B45309";
      ctx.font =
        '700 22px "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Nova商譽寶 ・ 顧客回饋", W / 2, 125);

      // Shop Name Title
      ctx.fillStyle = "#0F172A";
      ctx.font =
        '800 40px "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
      const displayTitle =
        cardTitle.length > 20 ? `${cardTitle.slice(0, 19)}…` : cardTitle;
      ctx.fillText(displayTitle, W / 2, 206);

      // QR Inner Frame
      const qrBoxSize = 590;
      const qrBoxX = (W - qrBoxSize) / 2;
      const qrBoxY = 262;
      drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 32);
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#E2E8F0";
      ctx.stroke();

      // Crisp QR Code
      const qrSize = 520;
      ctx.drawImage(
        sourceQrCanvas,
        (W - qrSize) / 2,
        qrBoxY + (qrBoxSize - qrSize) / 2,
        qrSize,
        qrSize,
      );

      // 5 Amber Gold Stars
      ctx.fillStyle = "#F59E0B";
      ctx.font = "700 42px sans-serif";
      ctx.fillText("★  ★  ★  ★  ★", W / 2, 922);

      // Bottom prompt banner
      ctx.fillStyle = "#0F172A";
      drawRoundedRect(ctx, 130, 968, W - 260, 74, 24);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font =
        '700 28px "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
      const displayPrompt =
        (promptText.trim() || "掃描抽好禮 / 留下寶貴意見").slice(0, 26);
      ctx.fillText(displayPrompt, W / 2, 1006);

      // Footer subtle URL
      ctx.fillStyle = "#94A3B8";
      ctx.font = "600 18px monospace";
      const shortUrl = activeUrl.replace(/^https?:\/\//, "").slice(0, 52);
      ctx.fillText(shortUrl, W / 2, 1084);
    }

    const dataUrl = exportCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${shopId}-qrcode.png`;
    link.click();
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              進階自訂 QR Code 產生與下載器
            </h2>
            <p className="text-xs text-slate-500">
              自由調整配色與餐桌立牌標籤，一鍵匯出高解析度 PNG 列印圖檔
            </p>
          </div>
        </div>

        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setUrlMode("production")}
            className={`rounded-md px-2.5 py-1 transition ${
              urlMode === "production"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            正式網域
          </button>
          <button
            type="button"
            onClick={() => setUrlMode("local")}
            className={`rounded-md px-2.5 py-1 transition ${
              urlMode === "local"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            目前預覽
          </button>
        </div>
      </div>

      {/* Hidden High-Res QR Source Canvas for 560px Crisp Export */}
      <div ref={exportQrHostRef} className="hidden" aria-hidden="true">
        <QRCodeCanvas
          value={activeUrl}
          size={560}
          bgColor={bgColor}
          fgColor={fgColor}
          level="H"
          marginSize={2}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Live Printable Card Preview */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-[#FAF8F5] p-5 lg:col-span-5">
          {showShopLabel ? (
            <div className="w-full max-w-[270px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
              <div className="h-2 w-full bg-[#F59E0B]" />
              <div className="flex flex-col items-center px-5 pt-4 pb-5 text-center">
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                  Nova商譽寶 ・ 顧客回饋
                </span>
                <p className="mt-2 inline-flex items-center justify-center gap-1 text-sm font-extrabold text-[#0F172A]">
                  <Building className="h-3.5 w-3.5 shrink-0 text-[#F59E0B]" />
                  <span className="line-clamp-1">{cardTitle}</span>
                </p>

                <div
                  className="mt-3.5 rounded-2xl border border-slate-200 p-3 shadow-sm"
                  style={{ backgroundColor: bgColor }}
                >
                  <QRCodeCanvas
                    value={activeUrl}
                    size={168}
                    bgColor={bgColor}
                    fgColor={fgColor}
                    level="M"
                    marginSize={1}
                  />
                </div>

                <div
                  className="mt-3 flex items-center gap-1"
                  aria-hidden="true"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]"
                    />
                  ))}
                </div>

                <div className="mt-2.5 w-full rounded-xl bg-[#0F172A] px-3 py-2 text-[11px] font-bold text-white">
                  {promptText.trim() || "掃描抽好禮 / 留下寶貴意見"}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl border border-slate-200 p-4 shadow-sm"
              style={{ backgroundColor: bgColor }}
            >
              <QRCodeCanvas
                value={activeUrl}
                size={196}
                bgColor={bgColor}
                fgColor={fgColor}
                level="M"
                marginSize={1}
              />
            </div>
          )}

          <p className="mt-3 text-[11px] font-medium text-slate-400">
            下載檔名：
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-slate-600 ring-1 ring-slate-200">
              {shopId}-qrcode.png
            </code>
          </p>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex flex-col justify-between space-y-5 lg:col-span-7">
          <div className="space-y-4">
            {/* Foreground Color */}
            <div>
              <span className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Palette className="h-3.5 w-3.5 text-amber-600" />
                前景色（QR Code Color）
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {FG_PRESETS.map((preset) => {
                  const selected =
                    fgColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setFgColor(preset.hex)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
                        selected
                          ? "border-[#0F172A] bg-[#0F172A] text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full ring-1 ring-black/15"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                  <input
                    type="color"
                    aria-label="自訂 QR Code 前景色"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <span className="font-mono text-[11px]">
                    {fgColor.toUpperCase()}
                  </span>
                </label>
              </div>
            </div>

            {/* Background Color */}
            <div>
              <span className="mb-2 block text-xs font-bold text-slate-700">
                背景色（Background Color）
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {BG_PRESETS.map((preset) => {
                  const selected =
                    bgColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setBgColor(preset.hex)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
                        selected
                          ? "border-[#0F172A] bg-[#0F172A] text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full ring-1 ring-slate-300"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                  <input
                    type="color"
                    aria-label="自訂 QR Code 背景色"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <span className="font-mono text-[11px]">
                    {bgColor.toUpperCase()}
                  </span>
                </label>
              </div>
            </div>

            {/* Show Shop Name Label Toggle */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    顯示店家名稱標籤（餐桌立牌樣式）
                  </p>
                  <p className="text-[11px] text-slate-500">
                    匯出 PNG 時一併加上店名標題外框與掃碼提示文字
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showShopLabel}
                  aria-label="顯示店家名稱標籤"
                  onClick={() => setShowShopLabel((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    showShopLabel ? "bg-amber-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      showShopLabel ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {showShopLabel && (
                <div className="mt-3">
                  <label
                    htmlFor="qr-prompt-text"
                    className="mb-1 block text-[11px] font-semibold text-slate-600"
                  >
                    下方提示文字
                  </label>
                  <input
                    id="qr-prompt-text"
                    type="text"
                    maxLength={32}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="掃描抽好禮 / 留下寶貴意見"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Dedicated URL */}
            <div>
              <p className="text-xs font-semibold text-slate-500">
                {urlMode === "production"
                  ? "門市專屬正式評分網址"
                  : "目前環境測試網址"}
              </p>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="flex-1 truncate font-mono text-xs text-slate-700">
                  {activeUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-amber-50 hover:text-amber-700"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>已複製</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>複製</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
            >
              <Download className="h-4 w-4 text-[#F59E0B]" />
              <span>下載高解析 PNG 立牌（{shopId}-qrcode.png）</span>
            </button>

            <Link
              href={feedbackPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>開啟顧客評分頁</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
