"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Crown,
  Plus,
  RotateCcw,
  Save,
  Sliders,
  Smartphone,
  Store,
  Zap,
} from "lucide-react";
import { ShopSettingsForm } from "./ShopSettingsForm";
import { LineConfigPanel } from "./LineConfigPanel";
import { QrCodeShareCard } from "./QrCodeShareCard";
import { LivePhonePreview } from "./LivePhonePreview";
import { PricingSection } from "./PricingSection";
import { EcpayUpgradeModal } from "./EcpayUpgradeModal";
import { useShopStore } from "@/lib/novashield/shopStore";
import { formatExpiresAtTaipei, getCycleLabel } from "@/lib/novashield/subscription";
import type { BillingCycle, ShopConfig } from "@/lib/novashield/types";
import { normalizeLineOfficialId, sanitizeShopId } from "@/lib/novashield/validation";

export function AdminDashboard() {
  const searchParams = useSearchParams();
  const queryShop = searchParams.get("shop");
  const paymentStatus = searchParams.get("payment");
  const initialShopId =
    queryShop && sanitizeShopId(queryShop)
      ? sanitizeShopId(queryShop)!
      : "shop123";

  const {
    shops,
    selectedShopId,
    draft: config,
    setDraft: setConfig,
    selectShop,
    persistShop,
    resetSelectedShop,
    createOrSwitchShop,
    refreshFromServer,
  } = useShopStore(initialShopId);

  const [newShopIdInput, setNewShopIdInput] = useState("");
  const [showNewShopInput, setShowNewShopInput] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"settings" | "preview">("settings");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalCycle, setUpgradeModalCycle] =
    useState<BillingCycle>("monthly");

  useEffect(() => {
    if (paymentStatus === "pending") {
      void refreshFromServer();
    }
  }, [paymentStatus, refreshFromServer]);

  function showToast(message: string) {
    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 4000);
  }

  function openUpgradeModal(cycle: BillingCycle = "monthly") {
    setUpgradeModalCycle(cycle);
    setUpgradeModalOpen(true);
  }

  async function handleSave() {
    const normalized: ShopConfig = {
      ...config,
      lineId:
        config.plan === "PRO"
          ? normalizeLineOfficialId(config.lineId) || `@${config.shopId}`
          : config.lineId,
    };
    const { synced } = await persistShop(normalized);
    showToast(
      synced
        ? "門市設定已儲存至拓新雲端資料庫，所有裝置的顧客評分頁將同步顯示。"
        : "雲端同步失敗，設定僅保留於本機瀏覽器。請確認 Supabase 已執行 030_novashield_shops.sql 建表。",
    );
  }

  async function handleResetDefaults() {
    const { synced } = await resetSelectedShop();
    showToast(
      synced
        ? "已還原為預設門市設定並同步至雲端資料庫（訂閱狀態維持不變）。"
        : "已還原為預設門市設定（僅本機，雲端同步失敗）。",
    );
  }

  async function handleCreateCustomShop() {
    const cleaned = sanitizeShopId(newShopIdInput);
    if (!cleaned) {
      showToast("門市代碼僅限英數字、底線與連字號（例如：cafe02）。");
      return;
    }
    const { synced } = await createOrSwitchShop(cleaned);
    setNewShopIdInput("");
    setShowNewShopInput(false);
    showToast(
      synced
        ? `已建立免費版門市：${cleaned}（已寫入雲端資料庫，需付費升級後解鎖專業版）`
        : `已建立免費版門市：${cleaned}（雲端同步失敗，僅本機）`,
    );
  }

  const shopList = Object.values(shops);
  const isPro = config.plan === "PRO";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Payment Return Banner */}
      {paymentStatus === "pending" && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-950 shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-600" />
            <span>
              {isPro
                ? "綠界付款已入帳確認，您的專業版功能已全面解鎖！"
                : "已返回後台。若剛完成綠界付款，系統將於收到綠界回調後自動開通專業版（約數秒內生效）。"}
            </span>
          </div>
          {!isPro && (
            <button
              type="button"
              onClick={() => void refreshFromServer()}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700"
            >
              重新整理開通狀態
            </button>
          )}
        </div>
      )}

      {/* Top Action Bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                店家管理後台
              </h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  isPro
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {isPro ? (
                  <>
                    <Crown className="h-3 w-3" />
                    專業版 PRO（{getCycleLabel(config.billingCycle)}）
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3" />
                    免費版 FREE ($0)
                  </>
                )}
              </span>
            </div>

            {isPro ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5 text-amber-600" />
                  方案到期日（台北）：
                  <strong className="text-slate-800">
                    {formatExpiresAtTaipei(config.planExpiresAt)}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <BellRing className="h-3.5 w-3.5" />
                  到期前 3 天自動寄送 Email 提醒（{config.emailNotification || "請先填寫信箱"}）
                </span>
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {config.subscriptionExpired
                  ? "您的專業版已到期並自動切回免費版；透過綠界續費後即可重新開啟全部付費功能。"
                  : "目前為免費版，進階付費功能將呈現鎖定狀態；完成綠界付款（$199/月 或 $1,990/年）後自動開通。"}
              </p>
            )}
          </div>

          {/* Authoritative ECPay Upgrade / Renewal Button (NO free toggle bypass) */}
          <button
            type="button"
            onClick={() => openUpgradeModal("monthly")}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#0F172A] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] sm:self-auto sm:text-sm"
          >
            <CreditCard className="h-4 w-4 text-[#F59E0B]" />
            <span>
              {isPro ? "綠界續費專業版" : "付費升級專業版 ($199/月)"}
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Store className="h-4 w-4 text-slate-500" />
              <select
                aria-label="切換門市"
                value={selectedShopId}
                onChange={(e) => selectShop(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none sm:text-sm"
              >
                {shopList.map((item) => (
                  <option key={item.shopId} value={item.shopId}>
                    {item.shopName} ({item.shopId} · {item.plan})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowNewShopInput((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>新增門市</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleResetDefaults()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              <span>重設</span>
            </button>

            <button
              type="button"
              onClick={() => void handleSave()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600 active:scale-[0.99] sm:text-sm"
            >
              <Save className="h-4 w-4" />
              <span>儲存設定</span>
            </button>
          </div>
        </div>
      </div>

      {showNewShopInput && (
        <div className="mb-5 flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:flex-row sm:items-center">
          <span className="text-xs font-bold text-amber-900">
            建立新門市代碼（預設免費版）：
          </span>
          <input
            type="text"
            value={newShopIdInput}
            onChange={(e) => setNewShopIdInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleCreateCustomShop();
              }
            }}
            placeholder="例如：cafe02 或 ramen-taipei"
            className="flex-1 rounded-xl border border-amber-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void handleCreateCustomShop()}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            建立並編輯
          </button>
        </div>
      )}

      {saveToast && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-200/70 p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("settings")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
            mobileTab === "settings"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>門市設定</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
            mobileTab === "preview"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600"
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>顧客端即時預覽</span>
        </button>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Settings */}
        <div
          className={`space-y-5 lg:col-span-7 ${
            mobileTab === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          <QrCodeShareCard shopId={config.shopId} shopName={config.shopName} />

          <LineConfigPanel
            config={config}
            onLineIdChange={(lineId) => setConfig({ ...config, lineId })}
            onUpgradeToPro={() => openUpgradeModal("monthly")}
          />

          <ShopSettingsForm
            config={config}
            onChange={setConfig}
            onUpgradeToPro={() => openUpgradeModal("monthly")}
          />
        </div>

        {/* Right: Sticky Mobile Live Preview */}
        <div
          className={`lg:col-span-5 ${
            mobileTab === "settings" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="lg:sticky lg:top-20">
            <LivePhonePreview config={config} />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mt-8">
        <PricingSection
          activePlan={config.plan}
          onUpgradeClick={(cycle) => openUpgradeModal(cycle)}
          compact
        />
      </div>

      {/* ECPay Checkout Modal */}
      <EcpayUpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        shopId={config.shopId}
        shopName={config.shopName}
        defaultEmail={config.emailNotification}
        initialCycle={upgradeModalCycle}
        isRenewal={isPro}
      />
    </div>
  );
}
