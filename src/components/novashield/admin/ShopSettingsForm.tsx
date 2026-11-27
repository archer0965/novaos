"use client";

import { useRef, useState } from "react";
import {
  Crown,
  ExternalLink,
  ImageIcon,
  Layers,
  Lock,
  Mail,
  Palette,
  Plus,
  SlidersHorizontal,
  Star,
  Store,
  Trash2,
  Upload,
} from "lucide-react";
import { ProUpgradeCard } from "./ProUpgradeCard";
import { DEFAULT_RATING_CATEGORIES } from "@/lib/novashield/mockData";
import type { RatingMode, ShopConfig } from "@/lib/novashield/types";
import {
  BRAND_COLOR_PRESETS,
  getSafeBrandColor,
  isAllowedEmailEndpoint,
  isSafeHttpUrl,
  isSafeImageSrc,
  isValidEmail,
} from "@/lib/novashield/validation";

interface ShopSettingsFormProps {
  config: ShopConfig;
  onChange: (next: ShopConfig) => void;
  onUpgradeToPro: () => void;
}

export function ShopSettingsForm({
  config,
  onChange,
  onUpgradeToPro,
}: ShopSettingsFormProps) {
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isPro = config.plan === "PRO";
  const logoUrl = config.logoUrl ?? "";
  const emailFormEndpoint = config.emailFormEndpoint ?? "";
  const ratingMode = config.ratingMode ?? (isPro ? "multi" : "single");

  const logoInvalid = logoUrl.trim() !== "" && !isSafeImageSrc(logoUrl);
  const googleUrlInvalid =
    config.googleReviewUrl.trim() !== "" &&
    !isSafeHttpUrl(config.googleReviewUrl);
  const emailInvalid =
    config.emailNotification.trim() !== "" &&
    !isValidEmail(config.emailNotification);
  const endpointInvalid =
    emailFormEndpoint.trim() !== "" &&
    !isAllowedEmailEndpoint(emailFormEndpoint);

  function updateField<K extends keyof ShopConfig>(key: K, value: ShopConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!isPro) return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (!/^image\/(png|jpeg|jpg|webp|gif)$/.test(file.type)) {
      setUploadError("僅支援 PNG、JPG、WEBP 或 GIF 圖片格式。");
      return;
    }
    if (file.size > 1024 * 1024) {
      setUploadError("圖片檔案大小不可超過 1 MB。");
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateField("logoUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleRatingModeChange(mode: RatingMode) {
    if (!isPro && mode === "multi") return;
    if (mode === "multi" && config.ratingCategories.length < 2) {
      onChange({
        ...config,
        ratingMode: mode,
        ratingCategories: [...DEFAULT_RATING_CATEGORIES],
      });
      return;
    }
    updateField("ratingMode", mode);
  }

  function handleAddCategory() {
    if (!isPro) return;
    const label = newCategoryLabel.trim();
    if (!label || config.ratingCategories.length >= 8) return;
    onChange({
      ...config,
      ratingMode: "multi",
      ratingCategories: [...config.ratingCategories, label],
    });
    setNewCategoryLabel("");
  }

  function handleUpdateCategory(index: number, label: string) {
    if (!isPro) return;
    const next = config.ratingCategories.map((item, idx) =>
      idx === index ? label : item,
    );
    updateField("ratingCategories", next);
  }

  function handleDeleteCategory(index: number) {
    if (!isPro || config.ratingCategories.length <= 1) return;
    updateField(
      "ratingCategories",
      config.ratingCategories.filter((_, idx) => idx !== index),
    );
  }

  return (
    <div className="space-y-5">
      {/* Store Basic Info Card (Available in FREE & PRO) */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">門市基本資訊</h2>
            <p className="text-xs text-slate-500">
              設定顯示於顧客評分頁面的門市名稱與 Google 商家評論連結
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="shop-name"
                className="mb-1.5 block text-sm font-semibold text-slate-800"
              >
                店家名稱
              </label>
              <input
                id="shop-name"
                type="text"
                maxLength={80}
                value={config.shopName}
                onChange={(e) => updateField("shopName", e.target.value)}
                placeholder="例如：山木日和咖啡廳・大安店"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="shop-tagline"
                className="mb-1.5 block text-sm font-semibold text-slate-800"
              >
                歡迎標語
              </label>
              <input
                id="shop-tagline"
                type="text"
                maxLength={140}
                value={config.tagline ?? ""}
                onChange={(e) => updateField("tagline", e.target.value)}
                placeholder="感謝您今日的光臨，邀請您分享用餐體驗"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="google-review-url"
                className="text-sm font-semibold text-slate-800"
              >
                Google 商家評論連結
              </label>
              {!googleUrlInvalid && config.googleReviewUrl && (
                <a
                  href={config.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-amber-600"
                >
                  <span>測試開啟</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <input
              id="google-review-url"
              type="url"
              value={config.googleReviewUrl}
              onChange={(e) => updateField("googleReviewUrl", e.target.value)}
              placeholder="https://search.google.com/local/writereview?placeid=..."
              className={`w-full rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 transition focus:bg-white focus:ring-2 focus:outline-none ${
                googleUrlInvalid
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-amber-500 focus:ring-amber-500/20"
              }`}
            />
            {googleUrlInvalid ? (
              <p className="mt-1 text-xs text-rose-600">
                請輸入以 https:// 開頭的 Google 商家評論網址。
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">
                可於 Google 商家檔案後台「要求提供評論」複製專屬連結。
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Free Plan Email Notification Card */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                客訴 Email 通知設定（免費版內建）
              </h2>
              <p className="text-xs text-slate-500">
                免費版顧客給予 1–3 星時，表單內容將透過 Email（Web3Forms / Formspree）寄送至店家信箱
              </p>
            </div>
          </div>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            {isPro ? "專業版已改用 LINE 即時私訊" : "免費版啟用中"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contact-email"
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              店家接收客訴信箱
            </label>
            <input
              id="contact-email"
              type="email"
              value={config.emailNotification}
              onChange={(e) => updateField("emailNotification", e.target.value)}
              placeholder="owner@yourshop.tw"
              className={`w-full rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 transition focus:bg-white focus:ring-2 focus:outline-none ${
                emailInvalid
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-amber-500 focus:ring-amber-500/20"
              }`}
            />
            {emailInvalid && (
              <p className="mt-1 text-xs text-rose-600">請輸入有效的 Email 格式。</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email-endpoint"
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              Formspree / Web3Forms Endpoint{" "}
              <span className="text-xs font-normal text-slate-400">(選填)</span>
            </label>
            <input
              id="email-endpoint"
              type="url"
              value={emailFormEndpoint}
              onChange={(e) => updateField("emailFormEndpoint", e.target.value)}
              placeholder="https://formspree.io/f/xxxxxx（留空則模擬寄送）"
              className={`w-full rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 transition focus:bg-white focus:ring-2 focus:outline-none ${
                endpointInvalid
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-amber-500 focus:ring-amber-500/20"
              }`}
            />
            {endpointInvalid ? (
              <p className="mt-1 text-xs text-rose-600">
                僅允許 https://formspree.io/... 或 https://api.web3forms.com/... 端點。
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                留空時將自動以 Mock 模擬寄送，可立即測試免費版客訴流程。
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Brand Customization Card (PRO Only - Locked on FREE) */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isPro
                  ? "bg-amber-50 text-amber-600"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {isPro ? (
                <Palette className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                品牌客製化（自訂 Logo 與主題色）
              </h2>
              <p className="text-xs text-slate-500">
                上傳門市專屬 Logo 圖片並調整評分頁品牌色系，強化顧客信任感
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              isPro
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {isPro ? (
              <>
                <Crown className="h-3 w-3" />
                <span>專業版已解鎖</span>
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                <span>專業版專屬鎖定</span>
              </>
            )}
          </span>
        </div>

        {!isPro && (
          <div className="mb-4">
            <ProUpgradeCard
              onUpgrade={onUpgradeToPro}
              detail="免費版使用系統預設圖示與標準色系；升級專業版即可上傳門市 Logo 並自訂品牌主題色。"
            />
          </div>
        )}

        <div
          className={`space-y-4 ${
            !isPro ? "pointer-events-none select-none opacity-55" : ""
          }`}
          aria-disabled={!isPro}
        >
          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="shop-logo-url"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800"
              >
                <ImageIcon className="h-4 w-4 text-slate-400" />
                <span>自訂 Logo 圖片（上傳或輸入網址）</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  disabled={!isPro}
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={!isPro}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:text-amber-700 disabled:cursor-not-allowed"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>上傳圖片</span>
                </button>
                <button
                  type="button"
                  disabled={!isPro}
                  onClick={() => updateField("logoUrl", "/novashield/logo-sunwood.svg")}
                  className="text-xs font-medium text-amber-600 hover:text-amber-700 disabled:cursor-not-allowed"
                >
                  套用示範 Logo
                </button>
              </div>
            </div>

            <input
              id="shop-logo-url"
              type="text"
              disabled={!isPro}
              value={
                logoUrl.startsWith("data:image/") ? "（已上傳本機圖片）" : logoUrl
              }
              onChange={(e) => {
                setUploadError(null);
                updateField("logoUrl", e.target.value);
              }}
              placeholder="https://example.com/logo.png 或點擊右上角上傳圖片"
              className={`w-full rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 transition focus:bg-white focus:ring-2 focus:outline-none disabled:cursor-not-allowed ${
                logoInvalid
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-amber-500 focus:ring-amber-500/20"
              }`}
            />
            {uploadError && (
              <p className="mt-1 text-xs text-rose-600">{uploadError}</p>
            )}
            {logoInvalid && (
              <p className="mt-1 text-xs text-rose-600">
                請輸入有效的 https://、http:// 圖片網址或上傳 PNG/JPG/WEBP 圖片。
              </p>
            )}
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-800">
              品牌主題色
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {BRAND_COLOR_PRESETS.map((preset) => {
                const selected =
                  getSafeBrandColor(config.brandColor).toLowerCase() ===
                  preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    disabled={!isPro}
                    onClick={() => updateField("brandColor", preset.hex)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      selected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span>{preset.name}</span>
                  </button>
                );
              })}

              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                <input
                  type="color"
                  disabled={!isPro}
                  aria-label="自訂品牌主題色"
                  value={getSafeBrandColor(config.brandColor)}
                  onChange={(e) => updateField("brandColor", e.target.value)}
                  className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <span className="font-mono text-[11px]">
                  {getSafeBrandColor(config.brandColor).toUpperCase()}
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Rating Categories & Threshold Card */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isPro
                  ? "bg-amber-50 text-amber-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                評分維度與分流門檻
              </h2>
              <p className="text-xs text-slate-500">
                {isPro
                  ? "自訂多維度評分項目並調整好評分流門檻"
                  : "免費版僅支援單一總體星等（預設 4 星以上跳轉 Google 商家）"}
              </p>
            </div>
          </div>

          {!isPro && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
              <Lock className="h-3 w-3" />
              多維度評分鎖定中
            </span>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="mb-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleRatingModeChange("single")}
            className={`rounded-xl border p-3 text-left transition ${
              !isPro || ratingMode === "single"
                ? "border-amber-500 bg-amber-50/70 ring-1 ring-amber-500/30"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">
                單一總體星等
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                免費版可用
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              顧客點選 1–5 總體星等快速完成評價
            </p>
          </button>

          <button
            type="button"
            disabled={!isPro}
            onClick={() => handleRatingModeChange("multi")}
            className={`rounded-xl border p-3 text-left transition ${
              isPro && ratingMode === "multi"
                ? "border-amber-500 bg-amber-50/70 ring-1 ring-amber-500/30"
                : !isPro
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70"
                  : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-900">
                {!isPro && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                <span>多維度自訂評分</span>
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                專業版
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              細分餐點品質、服務態度、環境衛生並自動平均
            </p>
          </button>
        </div>

        {/* Locked Upgrade Prompt when FREE */}
        {!isPro ? (
          <div className="mb-5 space-y-3">
            <ProUpgradeCard
              onUpgrade={onUpgradeToPro}
              detail="免費版僅開放單一總體星等評分；升級專業版即可自由新增／刪除餐點品質、服務態度、環境衛生等多維度項目。"
            />
            <div
              className="pointer-events-none select-none rounded-xl border border-slate-200/70 bg-slate-50 p-3.5 opacity-55"
              aria-disabled="true"
            >
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" />
                  多維度評分項目預覽（已鎖定）
                </span>
                <span>餐點品質 / 服務態度 / 環境衛生</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DEFAULT_RATING_CATEGORIES.map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-xs font-medium text-slate-400"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          ratingMode === "multi" && (
            <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  評分項目清單（{config.ratingCategories.length} / 8）
                </span>
                <span className="text-[11px] text-slate-400">
                  顧客評分後自動四捨五入計算平均星等
                </span>
              </div>

              <div className="space-y-2">
                {config.ratingCategories.map((label, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200/80">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      maxLength={30}
                      value={label}
                      onChange={(e) => handleUpdateCategory(idx, e.target.value)}
                      aria-label={`評分項目 ${idx + 1}`}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(idx)}
                      disabled={config.ratingCategories.length <= 1}
                      aria-label={`刪除 ${label}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {config.ratingCategories.length < 8 && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    maxLength={30}
                    value={newCategoryLabel}
                    onChange={(e) => setNewCategoryLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    placeholder="新增評分維度，例如：出餐速度、性價比..."
                    className="flex-1 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={!newCategoryLabel.trim()}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                    <span>新增</span>
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {/* Threshold Selector */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <SlidersHorizontal className="h-4 w-4 text-amber-500" />
              分流星等門檻
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
              <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              {isPro
                ? `${config.thresholdStar} 星以上導流`
                : "免費版固定 4 星以上"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[3, 4, 5].map((level) => {
              const activeThreshold = isPro ? config.thresholdStar : 4;
              const selected = activeThreshold === level;
              const lockedOption = !isPro && level !== 4;
              return (
                <button
                  key={level}
                  type="button"
                  disabled={lockedOption}
                  onClick={() => updateField("thresholdStar", level)}
                  className={`flex flex-col items-center rounded-xl border px-3 py-2.5 text-center transition ${
                    selected
                      ? "border-amber-500 bg-amber-50 text-amber-900 shadow-sm"
                      : lockedOption
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 opacity-60"
                        : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="inline-flex items-center gap-1 text-sm font-bold">
                    {lockedOption && <Lock className="h-3 w-3" />}
                    {level} 星以上
                  </span>
                  <span className="mt-0.5 text-[11px] text-slate-500">
                    {level === 4 ? "預設標準" : level === 5 ? "最嚴格" : "較寬鬆"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            <div className="rounded-lg bg-amber-50/80 px-3 py-2 text-amber-900">
              <span className="font-bold">
                ≥ {isPro ? config.thresholdStar : 4} 星：
              </span>
              顯示好評感謝畫面，跳轉 Google Maps 評論
            </div>
            <div className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">
              <span className="font-bold">
                ≤ {(isPro ? config.thresholdStar : 4) - 1} 星：
              </span>
              {isPro
                ? "導向私下意見表單，一鍵帶入 LINE Deep Link 私訊店長"
                : "導向客訴表單，發送 Email 通知至店家信箱"}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
