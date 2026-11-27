"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  CreditCard,
  Crown,
  Edit3,
  Layers,
  Lock,
  Plus,
  Save,
  Star,
  Store,
  X,
} from "lucide-react";
import { buildMultiStorePerformanceRows } from "@/lib/novashield/analytics";
import type { ShopConfig } from "@/lib/novashield/types";
import {
  normalizeLineOfficialId,
  sanitizeShopId,
} from "@/lib/novashield/validation";

interface MultiStoreManagerProps {
  shops: ShopConfig[];
  activeShopId: string;
  hasProAccess: boolean;
  onSelectShop: (shopId: string) => void;
  onCreateBranch: (payload: {
    shopId: string;
    shopName: string;
    googleReviewUrl: string;
    lineId: string;
  }) => Promise<{ ok: boolean; errorMessage?: string }>;
  onUpdateBranch: (
    shop: ShopConfig,
  ) => Promise<{ ok: boolean; errorMessage?: string }>;
  onUpgradeToPro: () => void;
}

export function MultiStoreManager({
  shops,
  activeShopId,
  hasProAccess,
  onSelectShop,
  onCreateBranch,
  onUpdateBranch,
  onUpgradeToPro,
}: MultiStoreManagerProps) {
  const [newBranchId, setNewBranchId] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const [newGoogleUrl, setNewGoogleUrl] = useState("");
  const [newLineId, setNewLineId] = useState("");
  const [creating, setCreating] = useState(false);
  const [formMsg, setFormMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [editingShop, setEditingShop] = useState<ShopConfig | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const rows = useMemo(() => buildMultiStorePerformanceRows(shops), [shops]);

  const totalReviews = rows.reduce((sum, r) => sum + r.totalCount, 0);
  const overallAvg =
    rows.length > 0
      ? Number(
          (
            rows.reduce((sum, r) => sum + r.averageRating * r.totalCount, 0) /
            Math.max(1, totalReviews)
          ).toFixed(1),
        )
      : 0;

  const bestBranch = useMemo(() => {
    if (rows.length === 0) return null;
    return [...rows].sort((a, b) => b.averageRating - a.averageRating)[0];
  }, [rows]);

  const attentionBranch = useMemo(() => {
    if (rows.length < 2) return null;
    return [...rows].sort((a, b) => b.interceptRate - a.interceptRate)[0];
  }, [rows]);

  async function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasProAccess) return;

    const cleanedId = sanitizeShopId(newBranchId);
    if (!cleanedId) {
      setFormMsg({
        type: "error",
        text: "分店代碼僅限英數字、底線與連字號（例如：branch-station）。",
      });
      return;
    }
    if (!newBranchName.trim()) {
      setFormMsg({ type: "error", text: "請填寫分店名稱（例如：站前店）。" });
      return;
    }

    setCreating(true);
    setFormMsg(null);
    const result = await onCreateBranch({
      shopId: cleanedId,
      shopName: newBranchName.trim(),
      googleReviewUrl: newGoogleUrl.trim(),
      lineId: normalizeLineOfficialId(newLineId),
    });
    setCreating(false);

    if (result.ok) {
      setNewBranchId("");
      setNewBranchName("");
      setNewGoogleUrl("");
      setNewLineId("");
      setFormMsg({
        type: "success",
        text: `已建立分店「${newBranchName.trim()}」（${cleanedId}）並同步至拓新雲端資料庫。`,
      });
    } else {
      setFormMsg({
        type: "error",
        text: result.errorMessage || "建立分店失敗，請確認分店代碼未被使用。",
      });
    }
  }

  async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingShop) return;
    setSavingEdit(true);
    const result = await onUpdateBranch({
      ...editingShop,
      lineId: normalizeLineOfficialId(editingShop.lineId),
    });
    setSavingEdit(false);
    if (result.ok) {
      setEditingShop(null);
      setFormMsg({
        type: "success",
        text: `已更新分店「${editingShop.shopName}」設定。`,
      });
    } else {
      setFormMsg({
        type: "error",
        text: result.errorMessage || "更新分店失敗，請稍後再試。",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Plan Gate */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                hasProAccess
                  ? "bg-[#0F172A] text-[#F59E0B]"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {hasProAccess ? (
                <Layers className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                多門市管理系統（Multi-Store Manager）
              </h2>
              <p className="text-xs text-slate-500">
                一個拓新雲端主帳號管理多家分店，即時比較各分店星等、Google 導流與客訴攔截表現
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
              hasProAccess
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {hasProAccess ? (
              <>
                <Crown className="h-3.5 w-3.5" />
                <span>專業版已解鎖（共 {rows.length} 間門市）</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" />
                <span>免費版限單一門市</span>
              </>
            )}
          </span>
        </div>

        {!hasProAccess && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50 via-amber-50/70 to-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  升級專業版 ($199/月) 解鎖多門市管理與客訴處理紀錄系統
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  免費版僅能管理單一門市；升級專業版後可於同一主帳號下新增分店、獨立綁定各店 Google 評論與 LINE 官方帳號，並檢視跨店績效排行。
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onUpgradeToPro}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0F172A] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <CreditCard className="h-3.5 w-3.5 text-[#F59E0B]" />
              <span>付費升級開啟功能</span>
            </button>
          </div>
        )}
      </section>

      {/* Multi-Store Overview KPIs & Comparison Table */}
      <div
        className={`space-y-6 ${
          !hasProAccess
            ? "pointer-events-none select-none opacity-45 blur-[1px]"
            : ""
        }`}
        aria-disabled={!hasProAccess}
      >
        {/* Cross-Store KPI Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500">旗下管理分店數</p>
            <p className="mt-2 text-2xl font-black text-[#0F172A]">
              {rows.length} <span className="text-xs font-semibold text-slate-400">間</span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500">跨店累積總回饋</p>
            <p className="mt-2 text-2xl font-black text-[#0F172A]">
              {totalReviews.toLocaleString("zh-TW")}{" "}
              <span className="text-xs font-semibold text-slate-400">筆</span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500">全品牌平均星等</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-2xl font-black text-[#0F172A]">
              <Star className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
              {overallAvg.toFixed(1)}
              <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-sm">
            <p className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
              <Award className="h-3.5 w-3.5" />
              滿意度冠軍分店
            </p>
            <p className="mt-2 truncate text-sm font-extrabold text-slate-900">
              {bestBranch ? `${bestBranch.shopName}` : "—"}
            </p>
            {bestBranch && (
              <p className="mt-0.5 text-xs font-bold text-emerald-700">
                平均 {bestBranch.averageRating.toFixed(1)} ★ ・ 導流率{" "}
                {bestBranch.googleRedirectRate.toFixed(1)}%
              </p>
            )}
          </div>
        </div>

        {/* Performance Comparison Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                跨店表現比較表（Multi-Store Overview）
              </h3>
              <p className="text-xs text-slate-500">
                一眼掌握各分店滿意度排行與需加強關注的客訴熱點
              </p>
            </div>
            {attentionBranch && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200">
                <AlertTriangle className="h-3.5 w-3.5" />
                近期客訴較高：{attentionBranch.shopName}（攔截率{" "}
                {attentionBranch.interceptRate.toFixed(1)}%）
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500">
                  <th className="px-5 py-3">分店名稱 / 代碼</th>
                  <th className="px-4 py-3 text-right">總回饋數</th>
                  <th className="px-4 py-3 text-right">平均星等</th>
                  <th className="px-4 py-3 text-right">Google 導流數</th>
                  <th className="px-4 py-3 text-right">負評攔截率</th>
                  <th className="px-5 py-3 text-right">快速操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const isCurrent = row.shopId === activeShopId;
                  const isTop = bestBranch?.shopId === row.shopId && rows.length > 1;
                  const shopObj = shops.find((s) => s.shopId === row.shopId);

                  return (
                    <tr
                      key={row.shopId}
                      className={
                        isCurrent ? "bg-amber-50/40" : "hover:bg-slate-50/70"
                      }
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 shrink-0 text-amber-600" />
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-slate-900">
                                {row.shopName}
                              </span>
                              {isCurrent && (
                                <span className="rounded-full bg-[#0F172A] px-2 py-0.5 text-[10px] font-bold text-white">
                                  檢視中
                                </span>
                              )}
                              {isTop && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  最高滿意度
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                              {row.shopId} ・ LINE: {row.lineId || "未綁定"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-bold text-slate-800">
                        {row.totalCount} 筆
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 font-extrabold text-amber-800">
                          <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                          {row.averageRating.toFixed(1)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <span className="font-bold text-emerald-700">
                          {row.googleRedirectCount} 筆
                        </span>
                        <span className="ml-1 text-[11px] text-slate-400">
                          ({row.googleRedirectRate.toFixed(1)}%)
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-bold ${
                            row.interceptRate >= 25
                              ? "bg-rose-50 text-rose-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {row.interceptRate.toFixed(1)}%（{row.interceptedCount} 筆）
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectShop(row.shopId)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                          >
                            切換管理
                          </button>
                          {shopObj && (
                            <button
                              type="button"
                              onClick={() => setEditingShop({ ...shopObj })}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-200"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>編輯</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Add New Branch Card */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">
              新增分店（自動綁定於您的拓新雲端專業版帳號）
            </h3>
            <p className="text-xs text-slate-500">
              每間分店擁有獨立的評分網址、專屬 QR Code、Google 商家連結與 LINE 官方帳號 ID
            </p>
          </div>

          <form
            onSubmit={handleCreateSubmit}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label
                htmlFor="new-branch-id"
                className="mb-1 block text-xs font-bold text-slate-700"
              >
                分店代碼（shopId）<span className="text-rose-500">*</span>
              </label>
              <input
                id="new-branch-id"
                type="text"
                required
                value={newBranchId}
                onChange={(e) => setNewBranchId(e.target.value)}
                placeholder="例如：station-store 或 xinyi02"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-mono text-xs text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="new-branch-name"
                className="mb-1 block text-xs font-bold text-slate-700"
              >
                分店名稱 <span className="text-rose-500">*</span>
              </label>
              <input
                id="new-branch-name"
                type="text"
                required
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="例如：山木日和咖啡廳・站前店"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="new-branch-google"
                className="mb-1 block text-xs font-bold text-slate-700"
              >
                分店專屬 Google 商家評論連結
              </label>
              <input
                id="new-branch-google"
                type="url"
                value={newGoogleUrl}
                onChange={(e) => setNewGoogleUrl(e.target.value)}
                placeholder="https://search.google.com/local/writereview?placeid=..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="new-branch-line"
                className="mb-1 block text-xs font-bold text-slate-700"
              >
                分店專屬 LINE 官方帳號 ID
              </label>
              <input
                id="new-branch-line"
                type="text"
                value={newLineId}
                onChange={(e) => setNewLineId(e.target.value)}
                placeholder="例如：@sunwood_station"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-mono text-xs text-slate-900 focus:border-[#06C755] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-1">
              {formMsg ? (
                <p
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    formMsg.type === "error"
                      ? "text-rose-700"
                      : "text-emerald-700"
                  }`}
                >
                  {formMsg.type === "error" ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>{formMsg.text}</span>
                </p>
              ) : (
                <span className="text-xs text-slate-400">
                  建立後即可於頂部門市切換器一鍵切換並下載分店專屬 QR Code。
                </span>
              )}

              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F172A] px-5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
              >
                <Plus className="h-4 w-4 text-[#F59E0B]" />
                <span>{creating ? "建立中..." : "新增分店"}</span>
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Edit Branch Modal */}
      {hasProAccess && editingShop && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setEditingShop(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-[#0F172A] px-5 py-4 text-white">
              <h3 className="text-sm font-extrabold">
                編輯分店資料（{editingShop.shopId}）
              </h3>
              <button
                type="button"
                onClick={() => setEditingShop(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  分店名稱
                </label>
                <input
                  type="text"
                  required
                  value={editingShop.shopName}
                  onChange={(e) =>
                    setEditingShop({ ...editingShop, shopName: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Google 商家評論連結
                </label>
                <input
                  type="url"
                  value={editingShop.googleReviewUrl}
                  onChange={(e) =>
                    setEditingShop({
                      ...editingShop,
                      googleReviewUrl: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  LINE 官方帳號 ID
                </label>
                <input
                  type="text"
                  value={editingShop.lineId}
                  onChange={(e) =>
                    setEditingShop({ ...editingShop, lineId: e.target.value })
                  }
                  placeholder="@branch_line_id"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-900 focus:border-[#06C755] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingShop(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-amber-600 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{savingEdit ? "儲存中..." : "儲存分店設定"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
