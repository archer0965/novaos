"use client";

import type {
  CategoryAverageMetric,
  ComplaintCaseStatus,
  ComplaintNoteEntry,
  FeedbackLogItem,
  FeedbackStatus,
  MultiStorePerformanceRow,
  ShopAnalyticsSummary,
  ShopConfig,
  StarDistributionBucket,
} from "./types";

const FEEDBACK_LOG_KEY = "novaos:novashield:analytics-logs:v1";
const STATUS_OVERRIDES_KEY = "novaos:novashield:analytics-status:v1";
const CASE_STATUS_KEY = "novaos:novashield:complaint-case-status:v1";
const CASE_NOTES_KEY = "novaos:novashield:complaint-case-notes:v1";

function hashShopId(shopId: string): number {
  let hash = 0;
  for (let i = 0; i < shopId.length; i++) {
    hash = (hash * 31 + shopId.charCodeAt(i)) % 1000;
  }
  return hash;
}

function getBaselineStarCounts(
  shopId: string,
): Record<5 | 4 | 3 | 2 | 1, number> {
  if (shopId === "shop123" || shopId === "shop-free") {
    return { 5: 76, 4: 26, 3: 13, 2: 8, 1: 5 };
  }
  if (shopId === "bistro88") {
    return { 5: 112, 4: 34, 3: 11, 2: 6, 1: 3 };
  }
  const seed = hashShopId(shopId);
  return {
    5: 42 + (seed % 58),
    4: 16 + (seed % 24),
    3: 6 + (seed % 11),
    2: 3 + (seed % 8),
    1: 1 + (seed % 6),
  };
}

function inferCategory(summary: string): string {
  if (/髒|黏|頭髮|異味|臭|衛生|冷氣|環境|座位/.test(summary)) return "環境衛生";
  if (/態度|跩|口氣|不耐煩|服務|接待/.test(summary)) return "服務態度";
  if (/等|慢|分鐘|漏|出餐|動線/.test(summary)) return "出餐速度";
  if (/算錯|發票|價格|結帳/.test(summary)) return "消費與結帳";
  if (/冷掉|口味|餐點|咖啡|主餐|包裝|外帶/.test(summary)) return "餐點品質";
  return "服務體驗";
}

function buildMockRecentFeedbacks(shopId: string): FeedbackLogItem[] {
  return [
    {
      id: `${shopId}-mock-1`,
      shopId,
      rating: 2,
      category: "出餐速度",
      summary:
        "週末尖峰時段候餐超過 25 分鐘，桌面水杯沒有及時補上，希望能改善出餐動線。",
      customerName: "陳小姐",
      phone: "0912-345-678",
      channel: "line",
      status: "messaged",
      caseStatus: "in_progress",
      notes: [
        {
          id: `${shopId}-note-1`,
          note: "已透過 LINE 私訊致歉並提供 $100 折價券，等待顧客回覆下次預約時間。",
          author: "值班店長",
          statusAfter: "in_progress",
          createdAt: "2026-11-27T02:35:00.000Z",
        },
      ],
      categoryScores: { 餐點品質: 4, 服務態度: 2, 環境衛生: 2 },
      createdAt: "2026-11-27T02:15:00.000Z",
    },
    {
      id: `${shopId}-mock-2`,
      shopId,
      rating: 5,
      category: "餐點品質",
      summary:
        "拿鐵風味非常有層次，店員接待親切，已前往 Google Maps 留下 5 星好評！",
      customerName: "林先生",
      channel: "google",
      status: "messaged",
      caseStatus: "resolved",
      categoryScores: { 餐點品質: 5, 服務態度: 5, 環境衛生: 5 },
      createdAt: "2026-11-27T01:40:00.000Z",
    },
    {
      id: `${shopId}-mock-3`,
      shopId,
      rating: 3,
      category: "環境衛生",
      summary:
        "靠窗座位冷氣出風口偏冷，建議調整風向或提供小毛毯，整體餐點水準不錯。",
      customerName: "王小姐",
      phone: "0933-812-094",
      channel: "line",
      status: "pending",
      caseStatus: "unhandled",
      notes: [],
      categoryScores: { 餐點品質: 4, 服務態度: 3, 環境衛生: 2 },
      createdAt: "2026-11-26T11:25:00.000Z",
    },
    {
      id: `${shopId}-mock-4`,
      shopId,
      rating: 1,
      category: "服務態度",
      summary:
        "點餐時漏掉附餐甜點，提醒後又等了 15 分鐘，櫃檯人員也沒有主動致歉，希望能加強出餐核對流程。",
      customerName: "張先生",
      phone: "0988-204-511",
      channel: "line",
      status: "pending",
      caseStatus: "unhandled",
      notes: [],
      categoryScores: { 餐點品質: 2, 服務態度: 1, 環境衛生: 3 },
      createdAt: "2026-11-26T08:10:00.000Z",
    },
    {
      id: `${shopId}-mock-5`,
      shopId,
      rating: 5,
      category: "環境衛生",
      summary:
        "環境明亮乾淨、音樂舒適，很適合下午工作，已分享到 Google 商家評論。",
      customerName: "吳小姐",
      channel: "google",
      status: "messaged",
      caseStatus: "resolved",
      categoryScores: { 餐點品質: 5, 服務態度: 5, 環境衛生: 5 },
      createdAt: "2026-11-26T06:45:00.000Z",
    },
    {
      id: `${shopId}-mock-6`,
      shopId,
      rating: 4,
      category: "餐點品質",
      summary:
        "主餐份量剛好、擺盤精緻，結帳速度也很快，下次還會帶朋友回訪。",
      customerName: "李先生",
      channel: "google",
      status: "messaged",
      caseStatus: "resolved",
      categoryScores: { 餐點品質: 5, 服務態度: 4, 環境衛生: 4 },
      createdAt: "2026-11-25T12:20:00.000Z",
    },
    {
      id: `${shopId}-mock-7`,
      shopId,
      rating: 2,
      category: "餐點品質",
      summary: "外帶紙袋提把偏薄容易斷裂，餐點拿回家有點傾斜，建議更換更耐重的包裝。",
      customerName: "周小姐",
      phone: "0921-607-332",
      channel: "email",
      status: "messaged",
      caseStatus: "resolved",
      notes: [
        {
          id: `${shopId}-note-7`,
          note: "已於 11/25 LINE 私訊致歉並退款 $100，顧客表示滿意；已通知採購更換加厚提袋。",
          author: "門市店長",
          statusAfter: "resolved",
          createdAt: "2026-11-25T10:30:00.000Z",
        },
      ],
      categoryScores: { 餐點品質: 3, 服務態度: 3, 環境衛生: 3 },
      createdAt: "2026-11-25T09:05:00.000Z",
    },
  ];
}

function readStoredLogs(): FeedbackLogItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FEEDBACK_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FeedbackLogItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStatusOverrides(): Record<string, FeedbackStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STATUS_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, FeedbackStatus>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function readCaseStatusOverrides(): Record<string, ComplaintCaseStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CASE_STATUS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ComplaintCaseStatus>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function readCaseNotesMap(): Record<string, ComplaintNoteEntry[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CASE_NOTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ComplaintNoteEntry[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function recordCustomerFeedbackEvent(
  item: Omit<FeedbackLogItem, "id" | "createdAt">,
): FeedbackLogItem {
  const created: FeedbackLogItem = {
    ...item,
    category: item.category || inferCategory(item.summary),
    caseStatus:
      item.caseStatus ??
      (item.rating <= 3 ? "unhandled" : "resolved"),
    notes: item.notes ?? [],
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const existing = readStoredLogs();
      const next = [created, ...existing].slice(0, 100);
      window.localStorage.setItem(FEEDBACK_LOG_KEY, JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
  }
  return created;
}

export function toggleFeedbackItemStatus(
  id: string,
  nextStatus: FeedbackStatus,
): void {
  if (typeof window === "undefined") return;
  try {
    const overrides = readStatusOverrides();
    overrides[id] = nextStatus;
    window.localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(overrides));

    const logs = readStoredLogs();
    const updatedLogs = logs.map((item) =>
      item.id === id ? { ...item, status: nextStatus } : item,
    );
    window.localStorage.setItem(FEEDBACK_LOG_KEY, JSON.stringify(updatedLogs));
  } catch {
    // ignore storage errors
  }
}

export function updateComplaintCaseStatus(
  id: string,
  nextStatus: ComplaintCaseStatus,
  author: string,
): void {
  if (typeof window === "undefined") return;
  try {
    const map = readCaseStatusOverrides();
    map[id] = nextStatus;
    window.localStorage.setItem(CASE_STATUS_KEY, JSON.stringify(map));

    // Sync legacy status badge as well
    toggleFeedbackItemStatus(
      id,
      nextStatus === "unhandled" ? "pending" : "messaged",
    );

    const statusLabel =
      nextStatus === "resolved"
        ? "已解決"
        : nextStatus === "in_progress"
          ? "處理中"
          : "未處理";
    addComplaintNote(id, `將客訴處理狀態更新為「${statusLabel}」`, author, nextStatus);
  } catch {
    // ignore storage errors
  }
}

export function addComplaintNote(
  id: string,
  note: string,
  author: string,
  statusAfter?: ComplaintCaseStatus,
): ComplaintNoteEntry | null {
  const trimmed = note.trim();
  if (!trimmed) return null;

  const entry: ComplaintNoteEntry = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    note: trimmed,
    author: author || "門市店長",
    statusAfter,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const notesMap = readCaseNotesMap();
      const existing = Array.isArray(notesMap[id]) ? notesMap[id] : [];
      notesMap[id] = [entry, ...existing].slice(0, 30);
      window.localStorage.setItem(CASE_NOTES_KEY, JSON.stringify(notesMap));
    } catch {
      // ignore storage errors
    }
  }

  return entry;
}

const DEFAULT_CATEGORY_BASELINES: Record<string, number> = {
  餐點品質: 4.8,
  餐點: 4.8,
  服務態度: 4.2,
  服務: 4.2,
  環境衛生: 4.6,
  環境: 4.6,
  用餐氛圍: 4.7,
  出餐速度: 4.1,
};

function mergeFeedbackListForShop(shopId: string): FeedbackLogItem[] {
  const customLogs = readStoredLogs().filter((item) => item.shopId === shopId);
  const statusOverrides = readStatusOverrides();
  const caseOverrides = readCaseStatusOverrides();
  const notesMap = readCaseNotesMap();
  const mockRecent = buildMockRecentFeedbacks(shopId);

  return [...customLogs, ...mockRecent].map((item) => {
    const baseNotes = Array.isArray(item.notes) ? item.notes : [];
    const extraNotes = Array.isArray(notesMap[item.id]) ? notesMap[item.id] : [];
    const combinedNotes = [...extraNotes, ...baseNotes].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const resolvedCaseStatus: ComplaintCaseStatus =
      caseOverrides[item.id] ??
      item.caseStatus ??
      (item.rating > 3
        ? "resolved"
        : item.status === "messaged"
          ? "in_progress"
          : "unhandled");

    return {
      ...item,
      category: item.category || inferCategory(item.summary),
      status: statusOverrides[item.id] ?? item.status,
      caseStatus: resolvedCaseStatus,
      notes: combinedNotes,
    };
  });
}

/** Loads all 1-3★ complaint records for the Feedback Management Hub. */
export function loadComplaintCases(shop: ShopConfig): FeedbackLogItem[] {
  return mergeFeedbackListForShop(shop.shopId).filter(
    (item) => item.rating <= 3,
  );
}

export function loadShopAnalytics(shop: ShopConfig): ShopAnalyticsSummary {
  const customLogs = readStoredLogs().filter((item) => item.shopId === shop.shopId);
  const starCounts: Record<5 | 4 | 3 | 2 | 1, number> = {
    ...getBaselineStarCounts(shop.shopId),
  };

  for (const log of customLogs) {
    const rounded = Math.max(1, Math.min(5, Math.round(log.rating))) as
      | 5
      | 4
      | 3
      | 2
      | 1;
    starCounts[rounded] += 1;
  }

  const totalCount =
    starCounts[5] +
    starCounts[4] +
    starCounts[3] +
    starCounts[2] +
    starCounts[1];

  const weightedSum =
    starCounts[5] * 5 +
    starCounts[4] * 4 +
    starCounts[3] * 3 +
    starCounts[2] * 2 +
    starCounts[1] * 1;

  const averageRating =
    totalCount > 0 ? Number((weightedSum / totalCount).toFixed(1)) : 0;

  const googleRedirectCount = starCounts[5] + starCounts[4];
  const interceptedCount = starCounts[3] + starCounts[2] + starCounts[1];
  const googleRedirectRate =
    totalCount > 0
      ? Number(((googleRedirectCount / totalCount) * 100).toFixed(1))
      : 0;
  const interceptRate =
    totalCount > 0
      ? Number(((interceptedCount / totalCount) * 100).toFixed(1))
      : 0;

  const starDistribution: StarDistributionBucket[] = ([5, 4, 3, 2, 1] as const).map(
    (star) => ({
      star,
      count: starCounts[star],
      percent:
        totalCount > 0
          ? Number(((starCounts[star] / totalCount) * 100).toFixed(1))
          : 0,
    }),
  );

  const categories =
    shop.ratingCategories.length > 0
      ? shop.ratingCategories
      : ["餐點品質", "服務態度", "環境衛生"];

  const categoryAverages: CategoryAverageMetric[] = categories.map(
    (label, idx) => {
      const baseAvg =
        DEFAULT_CATEGORY_BASELINES[label] ??
        Number((4.3 + ((idx * 3) % 6) * 0.1).toFixed(1));
      const baseWeight = 42;
      let extraSum = 0;
      let extraCount = 0;
      for (const log of customLogs) {
        const score = log.categoryScores?.[label];
        if (typeof score === "number" && score >= 1 && score <= 5) {
          extraSum += score;
          extraCount += 1;
        }
      }
      const combinedAvg =
        (baseAvg * baseWeight + extraSum) / (baseWeight + extraCount);
      return {
        label,
        average: Number(combinedAvg.toFixed(1)),
        count: baseWeight + extraCount,
      };
    },
  );

  const allMerged = mergeFeedbackListForShop(shop.shopId);
  const unhandledCount = allMerged.filter(
    (item) => item.rating <= 3 && item.caseStatus === "unhandled",
  ).length;

  return {
    totalCount,
    averageRating,
    googleRedirectCount,
    googleRedirectRate,
    interceptedCount,
    interceptRate,
    unhandledCount,
    starDistribution,
    categoryAverages,
    recentFeedbacks: allMerged.slice(0, 8),
  };
}

export function buildMultiStorePerformanceRows(
  shops: ShopConfig[],
): MultiStorePerformanceRow[] {
  return shops.map((shop) => {
    const analytics = loadShopAnalytics(shop);
    return {
      shopId: shop.shopId,
      shopName: shop.shopName,
      plan: shop.plan,
      lineId: shop.lineId,
      googleReviewUrl: shop.googleReviewUrl,
      totalCount: analytics.totalCount,
      averageRating: analytics.averageRating,
      googleRedirectCount: analytics.googleRedirectCount,
      googleRedirectRate: analytics.googleRedirectRate,
      interceptedCount: analytics.interceptedCount,
      interceptRate: analytics.interceptRate,
      unhandledCount: analytics.unhandledCount,
    };
  });
}
