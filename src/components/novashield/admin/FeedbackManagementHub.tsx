"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  Lock,
  MessageSquare,
  Phone,
  Plus,
  Sparkles,
  Star,
  Tag,
  User,
  X,
} from "lucide-react";
import {
  addComplaintNote,
  loadComplaintCases,
  updateComplaintCaseStatus,
} from "@/lib/novashield/analytics";
import type {
  ComplaintCaseStatus,
  FeedbackLogItem,
  ShopConfig,
} from "@/lib/novashield/types";

interface FeedbackManagementHubProps {
  config: ShopConfig;
  managerName: string;
  onUpgradeToPro: () => void;
  onAnalyzeWithAi?: (text: string) => void;
}

type FilterOption = "all" | ComplaintCaseStatus;

const STATUS_META: Record<
  ComplaintCaseStatus,
  {
    label: string;
    badgeClass: string;
    dotClass: string;
    activeBtnClass: string;
  }
> = {
  unhandled: {
    label: "未處理",
    badgeClass: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    dotClass: "bg-rose-500",
    activeBtnClass: "border-rose-500 bg-rose-50 text-rose-800",
  },
  in_progress: {
    label: "處理中",
    badgeClass: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
    dotClass: "bg-amber-500",
    activeBtnClass: "border-amber-500 bg-amber-50 text-amber-900",
  },
  resolved: {
    label: "已解決",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dotClass: "bg-emerald-500",
    activeBtnClass: "border-emerald-500 bg-emerald-50 text-emerald-800",
  },
};

function formatTaipeiDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function FeedbackManagementHub({
  config,
  managerName,
  onUpgradeToPro,
  onAnalyzeWithAi,
}: FeedbackManagementHubProps) {
  const [cases, setCases] = useState<FeedbackLogItem[]>(() =>
    loadComplaintCases(config),
  );
  const [filter, setFilter] = useState<FilterOption>("all");
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const isPro = config.plan === "PRO";

  useEffect(() => {
    setCases(loadComplaintCases(config));
    setActiveCaseId(null);
  }, [config]);

  const activeCase = cases.find((item) => item.id === activeCaseId) ?? null;

  useEffect(() => {
    if (!activeCase) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveCaseId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeCase]);

  const counts = {
    all: cases.length,
    unhandled: cases.filter((c) => c.caseStatus === "unhandled").length,
    in_progress: cases.filter((c) => c.caseStatus === "in_progress").length,
    resolved: cases.filter((c) => c.caseStatus === "resolved").length,
  };

  const filteredCases =
    filter === "all"
      ? cases
      : cases.filter((item) => item.caseStatus === filter);

  function handleChangeStatus(id: string, nextStatus: ComplaintCaseStatus) {
    if (!isPro) return;
    updateComplaintCaseStatus(id, nextStatus, managerName);
    setCases(loadComplaintCases(config));
  }

  function handleAddNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPro || !activeCase || !noteInput.trim()) return;
    addComplaintNote(activeCase.id, noteInput, managerName);
    setNoteInput("");
    setCases(loadComplaintCases(config));
  }

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isPro
                  ? "bg-[#0F172A] text-[#F59E0B]"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {isPro ? (
                <MessageSquare className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                客訴管理中心（{config.shopName}）
              </h2>
              <p className="text-xs text-slate-500">
                集中追蹤所有 1–3 星負評回饋、標記處理進度並留存店長內部備忘紀錄
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
              isPro
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {isPro ? (
              <>
                <Crown className="h-3.5 w-3.5" />
                <span>專業版已解鎖</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" />
                <span>專業版專屬鎖定</span>
              </>
            )}
          </span>
        </div>

        {/* FREE Plan Upgrade Lock Banner */}
        {!isPro && (
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
                  免費版僅透過 Email 收取客訴通知；升級專業版即可追蹤「未處理 → 處理中 → 已解決」進度與完整店長內部處理歷程。
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

        {/* Filter Tabs */}
        <div
          className={`mt-5 flex flex-wrap items-center gap-2 ${
            !isPro ? "pointer-events-none select-none opacity-50" : ""
          }`}
          aria-disabled={!isPro}
        >
          {(
            [
              { id: "all", label: "全部", count: counts.all, dot: "bg-slate-400" },
              {
                id: "unhandled",
                label: "未處理",
                count: counts.unhandled,
                dot: "bg-rose-500",
              },
              {
                id: "in_progress",
                label: "處理中",
                count: counts.in_progress,
                dot: "bg-amber-500",
              },
              {
                id: "resolved",
                label: "已解決",
                count: counts.resolved,
                dot: "bg-emerald-500",
              },
            ] as const
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={!isPro}
                onClick={() => setFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                  active
                    ? "border-[#0F172A] bg-[#0F172A] text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${tab.dot}`} />
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Complaint List */}
      <section
        className={`space-y-3 ${
          !isPro ? "pointer-events-none select-none opacity-45 blur-[1px]" : ""
        }`}
        aria-disabled={!isPro}
      >
        {filteredCases.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-sm font-bold text-slate-700">
              此狀態目前沒有待追蹤的客訴紀錄
            </p>
          </div>
        ) : (
          filteredCases.map((item) => {
            const st = item.caseStatus ?? "unhandled";
            const meta = STATUS_META[st];
            const noteCount = item.notes?.length ?? 0;

            return (
              <article
                key={item.id}
                onClick={() => isPro && setActiveCaseId(item.id)}
                className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-extrabold text-rose-700">
                      <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      {item.rating} 星
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      <Tag className="h-3 w-3 text-slate-500" />
                      {item.category || "服務體驗"}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${meta.badgeClass}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
                      {meta.label}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTaipeiDateTime(item.createdAt)} (台北)
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed font-medium text-slate-800">
                  {item.summary}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {item.customerName || "匿名顧客"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {item.phone || "未提供電話"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {noteCount} 筆內部處理紀錄
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onAnalyzeWithAi && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnalyzeWithAi(item.summary);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#0F172A] px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-slate-800"
                      >
                        <Sparkles className="h-3 w-3 text-[#F59E0B]" />
                        <span>AI 建議回覆</span>
                      </button>
                    )}
                    <span className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-800">
                      展開處理詳情 →
                    </span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Complaint Detail & Action History Drawer / Modal */}
      {isPro && activeCase && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="complaint-drawer-title"
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setActiveCaseId(null)}
        >
          <div
            className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#0F172A] px-6 py-4 text-white">
              <div>
                <p className="text-[11px] font-bold text-amber-300">
                  客訴處理與內部備忘歷程
                </p>
                <h3
                  id="complaint-drawer-title"
                  className="mt-0.5 text-base font-extrabold"
                >
                  {activeCase.category || "顧客回饋"} ・ {activeCase.rating} 星客訴
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveCaseId(null)}
                aria-label="關閉詳情"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              {/* Customer Complaint Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                    <User className="h-3.5 w-3.5" />
                    {activeCase.customerName || "匿名顧客"}
                    {activeCase.phone ? `（${activeCase.phone}）` : ""}
                  </span>
                  <span>{formatTaipeiDateTime(activeCase.createdAt)} (台北)</span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-900">
                  {activeCase.summary}
                </p>
              </div>

              {/* Status Workflow Switcher */}
              <div>
                <span className="mb-2 block text-xs font-bold text-slate-700">
                  標記處理狀態（未處理 ➜ 處理中 ➜ 已解決）
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(["unhandled", "in_progress", "resolved"] as const).map(
                    (statusKey) => {
                      const meta = STATUS_META[statusKey];
                      const selected =
                        (activeCase.caseStatus ?? "unhandled") === statusKey;
                      return (
                        <button
                          key={statusKey}
                          type="button"
                          onClick={() =>
                            handleChangeStatus(activeCase.id, statusKey)
                          }
                          className={`flex items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2.5 text-xs font-extrabold transition ${
                            selected
                              ? meta.activeBtnClass
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${meta.dotClass}`}
                          />
                          <span>{meta.label}</span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Internal Notes Form */}
              <form onSubmit={handleAddNote} className="space-y-2.5">
                <label
                  htmlFor="complaint-internal-note"
                  className="block text-xs font-bold text-slate-700"
                >
                  新增店長內部備忘紀錄（Internal Notes）
                </label>
                <textarea
                  id="complaint-internal-note"
                  rows={3}
                  maxLength={500}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="例如：「已於 11/27 LINE 私訊退款 $100，顧客表示滿意」或「已對當班員工進行 SOP 檢討」..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!noteInput.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F172A] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#F59E0B]" />
                    <span>寫入處理歷程</span>
                  </button>
                </div>
              </form>

              {/* Action History Log */}
              <div>
                <h4 className="mb-3 text-xs font-bold text-slate-700">
                  完整處理歷程（共 {activeCase.notes?.length ?? 0} 筆）
                </h4>
                {!activeCase.notes || activeCase.notes.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                    尚未有處理備忘紀錄，請於上方輸入並儲存。
                  </p>
                ) : (
                  <ol className="space-y-2.5">
                    {activeCase.notes.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                          <span className="font-bold text-slate-700">
                            {entry.author}
                          </span>
                          <span>
                            {formatTaipeiDateTime(entry.createdAt)} (台北)
                          </span>
                        </div>
                        <p className="mt-1.5 leading-relaxed text-slate-700">
                          {entry.note}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
