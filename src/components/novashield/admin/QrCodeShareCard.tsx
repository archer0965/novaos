"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { Check, Copy, Download, ExternalLink, QrCode } from "lucide-react";
import { PRODUCTION_URL as PRODUCTION_BASE_URL } from "@/lib/site";

interface QrCodeShareCardProps {
  shopId: string;
  shopName: string;
}

export function QrCodeShareCard({ shopId, shopName }: QrCodeShareCardProps) {
  const [urlMode, setUrlMode] = useState<"production" | "local">("production");
  const [localOrigin, setLocalOrigin] = useState(PRODUCTION_BASE_URL);
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement | null>(null);

  const feedbackPath = `/novashield/feedback/${encodeURIComponent(shopId)}`;
  const productionUrl = `${PRODUCTION_BASE_URL}${feedbackPath}`;
  const activeUrl =
    urlMode === "production" ? productionUrl : `${localOrigin}${feedbackPath}`;

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

  function handleDownloadQr() {
    const canvas = qrContainerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `novashield-qr-${shopId}.png`;
    link.click();
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              專屬評分 QR Code 與網址
            </h2>
            <p className="text-xs text-slate-500">
              列印於餐桌立牌或結帳櫃檯，顧客掃碼即可進入評分分流頁
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

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          ref={qrContainerRef}
          aria-label={`${shopName} 顧客評分 QR Code`}
          className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm"
        >
          <QRCodeCanvas
            value={activeUrl}
            size={140}
            bgColor="#ffffff"
            fgColor="#0f172a"
            level="M"
            marginSize={1}
          />
        </div>

        <div className="w-full flex-1 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {urlMode === "production" ? "門市專屬正式評分網址" : "目前環境測試網址"}
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

          <div className="flex flex-wrap gap-2">
            <Link
              href={feedbackPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>開啟顧客評分頁</span>
            </Link>

            <button
              type="button"
              onClick={handleDownloadQr}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>下載 QR 圖檔</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
