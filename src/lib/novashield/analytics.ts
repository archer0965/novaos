"use client";

import type {
  CategoryAverageMetric,
  FeedbackLogItem,
  FeedbackStatus,
  ShopAnalyticsSummary,
  ShopConfig,
  StarDistributionBucket,
} from "./types";

const FEEDBACK_LOG_KEY = "novaos:novashield:analytics-logs:v1";
const STATUS_OVERRIDES_KEY = "novaos:novashield:analytics-status:v1";

/**
 * Baseline historical distribution (128 reviews: avg ~4.6, 102 positive 4-5★, 26 intercepted 1-3★)
 * merged seamlessly with any new live local submissions so every merchant sees a complete dashboard.
 */
const BASELINE_STAR_COUNTS: Record<5 | 4 | 3 | 2 | 1, number> = {
  5: 76,
  4: 26,
  3: 13,
  2: 8,
  1: 5,
};

function buildMockRecentFeedbacks(shopId: string): FeedbackLogItem[] {
  return [
    {
      id: `${shopId}-mock-1`,
      shopId,
      rating: 2,
      summary: "週末尖峰時段候餐超過 25 分鐘，桌面水杯沒有及時補上，希望能改善出餐動線。",
      customerName: "陳小姐",
      phone: "0912-345-678",
      channel: "line",
      status: "messaged",
      categoryScores: { 餐點品質: 4, 服務態度: 2, 環境衛生: 2 },
      createdAt: "2026-11-27T02:15:00.000Z",
    },
    {
      id: `${shopId}-mock-2`,
      shopId,
      rating: 5,
      summary: "拿鐵風味非常有層次，店員接待親切，已前往 Google Maps 留下 5 星好評！",
      customerName: "林先生",
      channel: "google",
      status: "messaged",
      categoryScores: { 餐點品質: 5, 服務態度: 5, 環境衛生: 5 },
      createdAt: "2026-11-27T01:40:00.000Z",
    },
    {
      id: `${shopId}-mock-3`,
      shopId,
      rating: 3,
      summary: "靠窗座位冷氣出風口偏冷，建議調整風向或提供小毛毯，整體餐點水準不錯。",
      customerName: "王小姐",
      phone: "0933-812-094",
      channel: "line",
      status: "pending",
      categoryScores: { 餐點品質: 4, 服務態度: 3, 環境衛生: 2 },
      createdAt: "2026-11-26T11:25:00.000Z",
    },
    {
      id: `${shopId}-mock-4`,
      shopId,
      rating: 1,
      summary: "點餐時漏掉附餐甜點，提醒後又等了 15 分鐘，希望能加強出餐核對流程。",
      customerName: "張先生",
      phone: "0988-204-511",
      channel: "line",
      status: "pending",
      categoryScores: { 餐點品質: 2, 服務態度: 1, 環境衛生: 3 },
      createdAt: "2026-11-26T08:10:00.000Z",
    },
    {
      id: `${shopId}-mock-5`,
      shopId,
      rating: 5,
      summary: "環境明亮乾淨、音樂舒適，很適合下午工作，已分享到 Google 商家評論。",
      customerName: "吳小姐",
      channel: "google",
      status: "messaged",
      categoryScores: { 餐點品質: 5, 服務態度: 5, 環境衛生: 5 },
      createdAt: "2026-11-26T06:45:00.000Z",
    },
    {
      id: `${shopId}-mock-6`,
      shopId,
      rating: 4,
      summary: "主餐份量剛好、擺盤精緻，結帳速度也很快，下次還會帶朋友回訪。",
      customerName: "李先生",
      channel: "google",
      status: "messaged",
      categoryScores: { 餐點品質: 5, 服務態度: 4, 環境衛生: 4 },
      createdAt: "2026-11-25T12:20:00.000Z",
    },
    {
      id: `${shopId}-mock-7`,
      shopId,
      rating: 2,
      summary: "外帶紙袋提把偏薄容易斷裂，建議更換更耐重的包裝。",
      customerName: "周小姐",
      phone: "0921-607-332",
      channel: "email",
      status: "messaged",
      categoryScores: { 餐點品質: 4, 服務態度: 2, 環境衛生: 3 },
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

export function recordCustomerFeedbackEvent(
  item: Omit<FeedbackLogItem, "id" | "createdAt">,
): FeedbackLogItem {
  const created: FeedbackLogItem = {
    ...item,
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

export function loadShopAnalytics(shop: ShopConfig): ShopAnalyticsSummary {
  const customLogs = readStoredLogs().filter((item) => item.shopId === shop.shopId);
  const statusOverrides = readStatusOverrides();

  const starCounts: Record<5 | 4 | 3 | 2 | 1, number> = {
    ...BASELINE_STAR_COUNTS,
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

  const mockRecent = buildMockRecentFeedbacks(shop.shopId);
  const mergedRecent = [...customLogs, ...mockRecent]
    .slice(0, 8)
    .map((item) => ({
      ...item,
      status: statusOverrides[item.id] ?? item.status,
    }));

  return {
    totalCount,
    averageRating,
    googleRedirectCount,
    googleRedirectRate,
    interceptedCount,
    starDistribution,
    categoryAverages,
    recentFeedbacks: mergedRecent,
  };
}
