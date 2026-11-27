import type { AiQuotaState } from "./aiQuota";

export type PlanTier = "FREE" | "PRO";

export type BillingCycle = "monthly" | "yearly";

export type RatingMode = "single" | "multi";

export type FeedbackStatus = "messaged" | "pending";

export interface ShopConfig {
  shopId: string;
  shopName: string;
  logoUrl?: string;
  googleReviewUrl: string;
  lineId: string;
  plan: PlanTier;
  billingCycle?: BillingCycle | null;
  planExpiresAt?: string | null;
  reminder3dSentFor?: string | null;
  subscriptionExpired?: boolean;
  thresholdStar: number;
  ratingCategories: string[];
  emailNotification: string;
  tagline?: string;
  brandColor?: string;
  emailFormEndpoint?: string;
  ratingMode?: RatingMode;
  /** Persistent AI analysis quota & top-up credits (synced with server + localStorage) */
  aiQuota?: AiQuotaState;
}

export interface DimensionScore {
  label: string;
  score: number;
}

export interface LineDeepLinkResult {
  lineOfficialId: string;
  messageText: string;
  deepLinkUrl: string;
}

export interface EmailFeedbackResult {
  mode: "live" | "mock";
  providerLabel: string;
  recipientEmail: string;
  subject: string;
  bodyText: string;
  sentAt: string;
}

export interface FeedbackLogItem {
  id: string;
  shopId: string;
  rating: number;
  summary: string;
  customerName?: string;
  phone?: string;
  channel: "google" | "line" | "email";
  status: FeedbackStatus;
  categoryScores?: Record<string, number>;
  createdAt: string;
}

export interface StarDistributionBucket {
  star: 5 | 4 | 3 | 2 | 1;
  count: number;
  percent: number;
}

export interface CategoryAverageMetric {
  label: string;
  average: number;
  count: number;
}

export interface ShopAnalyticsSummary {
  totalCount: number;
  averageRating: number;
  googleRedirectCount: number;
  googleRedirectRate: number;
  interceptedCount: number;
  starDistribution: StarDistributionBucket[];
  categoryAverages: CategoryAverageMetric[];
  recentFeedbacks: FeedbackLogItem[];
}
