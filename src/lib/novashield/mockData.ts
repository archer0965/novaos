import type { ShopConfig } from "./types";

export const DEFAULT_RATING_CATEGORIES: string[] = [
  "餐點品質",
  "服務態度",
  "環境衛生",
];

export const DEFAULT_GOOGLE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJ_demo_sunwood_cafe";

export const MOCK_SHOPS: Record<string, ShopConfig> = {
  shop123: {
    shopId: "shop123",
    shopName: "山木日和咖啡廳・大安店",
    tagline: "感謝您今日的光臨，邀請您花 15 秒分享用餐體驗",
    logoUrl: "/novashield/logo-sunwood.svg",
    brandColor: "#F59E0B",
    googleReviewUrl: DEFAULT_GOOGLE_REVIEW_URL,
    lineId: "",
    plan: "FREE",
    billingCycle: null,
    planExpiresAt: null,
    thresholdStar: 4,
    ratingCategories: ["餐點品質", "服務態度", "環境衛生"],
    emailNotification: "manager@sunwoodcafe.tw",
    emailFormEndpoint: "",
    ratingMode: "single",
  },
  "shop-free": {
    shopId: "shop-free",
    shopName: "暖暖手作早餐店",
    tagline: "歡迎為我們今天的整體體驗評分，祝您有美好的一天",
    logoUrl: "",
    brandColor: "#F59E0B",
    googleReviewUrl:
      "https://search.google.com/local/writereview?placeid=ChIJ_demo_warm_morning",
    lineId: "",
    plan: "FREE",
    billingCycle: null,
    planExpiresAt: null,
    thresholdStar: 4,
    ratingCategories: ["餐點品質", "服務態度", "環境衛生"],
    emailNotification: "owner@warmmorning.tw",
    emailFormEndpoint: "",
    ratingMode: "single",
  },
  bistro88: {
    shopId: "bistro88",
    shopName: "暮光義式餐酒館・信義旗艦（專業版展示）",
    tagline: "為今晚的餐點與服務評分，您的回饋是我們進步的關鍵",
    logoUrl: "/novashield/logo-bistro.svg",
    brandColor: "#0F172A",
    googleReviewUrl:
      "https://search.google.com/local/writereview?placeid=ChIJ_demo_twilight_bistro88",
    lineId: "@bistro88",
    plan: "PRO",
    billingCycle: "yearly",
    planExpiresAt: "2027-11-27T00:00:00.000Z",
    thresholdStar: 4,
    ratingCategories: ["餐點品質", "服務態度", "用餐氛圍", "出餐速度"],
    emailNotification: "service@bistro88.tw",
    emailFormEndpoint: "",
    ratingMode: "multi",
  },
};

export function getInitialShopConfig(shopId: string): ShopConfig {
  const matched = MOCK_SHOPS[shopId];
  if (matched) {
    return {
      ...matched,
      ratingCategories: [...matched.ratingCategories],
    };
  }
  return createFallbackShopConfig(shopId);
}

export function createFallbackShopConfig(shopId: string): ShopConfig {
  return {
    shopId,
    shopName: `示範門市 (${shopId})`,
    tagline: "感謝您今日的光臨，邀請您花 15 秒分享體驗",
    logoUrl: "",
    brandColor: "#F59E0B",
    googleReviewUrl: DEFAULT_GOOGLE_REVIEW_URL,
    lineId: "",
    plan: "FREE",
    billingCycle: null,
    planExpiresAt: null,
    thresholdStar: 4,
    ratingCategories: [...DEFAULT_RATING_CATEGORIES],
    emailNotification: "",
    emailFormEndpoint: "",
    ratingMode: "single",
  };
}
