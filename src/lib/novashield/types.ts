export type PlanTier = "FREE" | "PRO";

export type BillingCycle = "monthly" | "yearly";

export type RatingMode = "single" | "multi";

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
