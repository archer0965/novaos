"use client";

import { useMemo, useState } from "react";
import { Sparkles, Star, Store } from "lucide-react";
import { StarRating } from "@/components/novashield/StarRating";
import { PositiveReviewCard } from "./PositiveReviewCard";
import { PrivateFeedbackForm } from "./PrivateFeedbackForm";
import { LineRedirectCard } from "./LineRedirectCard";
import { EmailFeedbackForm } from "./EmailFeedbackForm";
import { EmailSentSuccessCard } from "./EmailSentSuccessCard";
import { CustomerRightsNotice } from "@/components/novashield/legal/CustomerRightsNotice";
import { recordCustomerFeedbackEvent } from "@/lib/novashield/analytics";
import { DEFAULT_GOOGLE_REVIEW_URL } from "@/lib/novashield/mockData";
import type {
  DimensionScore,
  EmailFeedbackResult,
  LineDeepLinkResult,
  ShopConfig,
} from "@/lib/novashield/types";
import {
  getSafeBrandColor,
  getSafeExternalUrl,
  isSafeImageSrc,
} from "@/lib/novashield/validation";

interface CustomerFeedbackFlowProps {
  shop: ShopConfig;
  isPreview?: boolean;
}

export function CustomerFeedbackFlow({
  shop,
  isPreview = false,
}: CustomerFeedbackFlowProps) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [deepLinkResult, setDeepLinkResult] =
    useState<LineDeepLinkResult | null>(null);
  const [emailResult, setEmailResult] = useState<EmailFeedbackResult | null>(
    null,
  );
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);

  const isPro = shop.plan === "PRO";

  // Strict plan gating:
  // FREE plan ALWAYS uses single overall star rating, default threshold 4, no custom logo/brand color, and Email-only complaints.
  const effectiveThreshold = isPro ? shop.thresholdStar : 4;
  const effectiveBrandColor = isPro
    ? getSafeBrandColor(shop.brandColor)
    : "#F59E0B";

  const activeDimensions = useMemo(() => {
    if (
      !isPro ||
      shop.ratingMode === "single" ||
      shop.ratingCategories.length === 0
    ) {
      return [{ id: "overall", label: "總體體驗" }];
    }
    return shop.ratingCategories.map((label, idx) => ({
      id: `cat-${idx}-${label}`,
      label,
    }));
  }, [isPro, shop.ratingMode, shop.ratingCategories]);

  const isSingleMode = activeDimensions.length === 1;

  const ratedCount = activeDimensions.filter(
    (dim) => (scores[dim.id] ?? 0) > 0,
  ).length;
  const allRated =
    ratedCount === activeDimensions.length && activeDimensions.length > 0;

  const exactAverage = useMemo(() => {
    if (!allRated) return 0;
    const sum = activeDimensions.reduce(
      (acc, dim) => acc + (scores[dim.id] ?? 0),
      0,
    );
    return sum / activeDimensions.length;
  }, [allRated, activeDimensions, scores]);

  const roundedAverage = allRated ? Math.round(exactAverage) : 0;

  const dimensionScores: DimensionScore[] = useMemo(
    () =>
      activeDimensions
        .filter((dim) => (scores[dim.id] ?? 0) > 0)
        .map((dim) => ({
          label: dim.label,
          score: scores[dim.id],
        })),
    [activeDimensions, scores],
  );

  const safeGoogleUrl = getSafeExternalUrl(
    shop.googleReviewUrl,
    DEFAULT_GOOGLE_REVIEW_URL,
  );
  const logoUrl = shop.logoUrl ?? "";
  const hasCustomLogo = Boolean(
    isPro &&
      logoUrl &&
      isSafeImageSrc(logoUrl) &&
      failedLogoUrl !== logoUrl,
  );

  function handleRate(dimId: string, score: number) {
    setScores((prev) => ({ ...prev, [dimId]: score }));
  }

  function handleLineDeepLinkGenerated(result: LineDeepLinkResult) {
    setDeepLinkResult(result);
    const categoryScores: Record<string, number> = {};
    for (const d of dimensionScores) {
      categoryScores[d.label] = d.score;
    }
    const suggestionLine =
      result.messageText
        .split("\n")
        .find((line) => line.startsWith("改善建議："))
        ?.replace("改善建議：", "") || "顧客已透過 LINE 私訊反映意見";
    const nameLine = result.messageText
      .split("\n")
      .find((line) => line.startsWith("聯絡姓名："))
      ?.replace("聯絡姓名：", "");
    const phoneLine = result.messageText
      .split("\n")
      .find((line) => line.startsWith("聯絡電話："))
      ?.replace("聯絡電話：", "");

    recordCustomerFeedbackEvent({
      shopId: shop.shopId,
      rating: roundedAverage,
      summary: suggestionLine,
      customerName: nameLine,
      phone: phoneLine,
      channel: "line",
      status: "messaged",
      categoryScores: isSingleMode ? undefined : categoryScores,
    });
  }

  function handleEmailFeedbackSent(result: EmailFeedbackResult) {
    setEmailResult(result);
    const suggestionLine =
      result.bodyText
        .split("\n")
        .find((line) => line.startsWith("改善建議："))
        ?.replace("改善建議：", "") || "顧客已送出 Email 意見回饋";
    const nameLine = result.bodyText
      .split("\n")
      .find((line) => line.startsWith("顧客姓名："))
      ?.replace("顧客姓名：", "");
    const phoneLine = result.bodyText
      .split("\n")
      .find((line) => line.startsWith("聯絡電話："))
      ?.replace("聯絡電話：", "");

    recordCustomerFeedbackEvent({
      shopId: shop.shopId,
      rating: roundedAverage,
      summary: suggestionLine,
      customerName: nameLine === "未提供" ? undefined : nameLine,
      phone: phoneLine === "未提供" ? undefined : phoneLine,
      channel: "email",
      status: "pending",
    });
  }

  function handlePositiveGoogleClick() {
    const categoryScores: Record<string, number> = {};
    for (const d of dimensionScores) {
      categoryScores[d.label] = d.score;
    }
    recordCustomerFeedbackEvent({
      shopId: shop.shopId,
      rating: roundedAverage,
      summary: `顧客給予 ${roundedAverage} 星好評，已點擊前往 Google Maps 留下公開評論。`,
      channel: "google",
      status: "messaged",
      categoryScores: isSingleMode ? undefined : categoryScores,
    });
  }

  function handleReset() {
    setScores({});
    setDeepLinkResult(null);
    setEmailResult(null);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {/* Brand Accent Bar (Pro customizable, Free default amber) */}
        <div
          className="h-1.5 w-full transition-colors"
          style={{ backgroundColor: effectiveBrandColor }}
        />

        <div className={isPreview ? "p-4" : "p-5 sm:p-6"}>
          {/* Store Header */}
          <div className="flex flex-col items-center text-center">
            <div
              className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 shadow-sm"
              style={{
                backgroundColor: hasCustomLogo
                  ? "#FFFFFF"
                  : `${effectiveBrandColor}1A`,
              }}
            >
              {hasCustomLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={`${shop.shopName} Logo`}
                  className="h-full w-full object-cover"
                  onError={() => setFailedLogoUrl(logoUrl)}
                />
              ) : (
                <Store
                  className="h-8 w-8"
                  style={{ color: effectiveBrandColor }}
                />
              )}
            </div>

            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {shop.shopName}
            </h1>
            {shop.tagline && (
              <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                {shop.tagline}
              </p>
            )}
          </div>

          {/* Step Content */}
          <div className="mt-5">
            {isPro && deepLinkResult ? (
              <LineRedirectCard
                shopName={shop.shopName}
                result={deepLinkResult}
                onReset={handleReset}
                compact={isPreview}
              />
            ) : !isPro && emailResult ? (
              <EmailSentSuccessCard
                shopName={shop.shopName}
                result={emailResult}
                onReset={handleReset}
                compact={isPreview}
              />
            ) : (
              <div className="space-y-4">
                {/* Rating Card */}
                <div className="rounded-2xl border border-slate-100 bg-white p-1">
                  {isSingleMode ? (
                    <StarRating
                      value={scores[activeDimensions[0].id] ?? 0}
                      onChange={(s) => handleRate(activeDimensions[0].id, s)}
                      size="lg"
                      compact={isPreview}
                    />
                  ) : (
                    <div className="space-y-4">
                      {activeDimensions.map((dim) => (
                        <StarRating
                          key={dim.id}
                          label={dim.label}
                          value={scores[dim.id] ?? 0}
                          onChange={(s) => handleRate(dim.id, s)}
                          size={isPreview ? "sm" : "md"}
                          compact={isPreview}
                        />
                      ))}
                    </div>
                  )}

                  {/* Progress / Calculated Average Pill */}
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs">
                    {allRated ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          {isSingleMode ? "您的評分" : "平均星等（四捨五入）"}
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                          {roundedAverage} 星
                          {!isSingleMode && (
                            <span className="font-normal text-slate-400">
                              ({exactAverage.toFixed(1)})
                            </span>
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-500">
                          {isSingleMode
                            ? "請點選上方總體星等開始評價"
                            : `已完成 ${ratedCount} / ${activeDimensions.length} 項評分`}
                        </span>
                        <span className="font-medium text-amber-600">
                          {isSingleMode ? "1–5 顆星" : "評完自動計算"}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Feedback First Branching */}
                {allRated && (
                  <div>
                    {roundedAverage >= effectiveThreshold ? (
                      <PositiveReviewCard
                        shopName={shop.shopName}
                        roundedRating={roundedAverage}
                        exactAverage={exactAverage}
                        googleReviewUrl={safeGoogleUrl}
                        accentColor={effectiveBrandColor}
                        onGoogleClick={handlePositiveGoogleClick}
                        onResetRating={handleReset}
                        compact={isPreview}
                      />
                    ) : isPro ? (
                      <PrivateFeedbackForm
                        shopId={shop.shopId}
                        shopName={shop.shopName}
                        lineOfficialId={shop.lineId}
                        roundedRating={roundedAverage}
                        exactAverage={exactAverage}
                        dimensions={isSingleMode ? undefined : dimensionScores}
                        onDeepLinkGenerated={handleLineDeepLinkGenerated}
                        compact={isPreview}
                      />
                    ) : (
                      <EmailFeedbackForm
                        shopId={shop.shopId}
                        shopName={shop.shopName}
                        contactEmail={shop.emailNotification}
                        emailFormEndpoint={shop.emailFormEndpoint}
                        rating={roundedAverage}
                        onEmailSent={handleEmailFeedbackSent}
                        compact={isPreview}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compliance & Customer Rights Footer - Always Visible */}
      <CustomerRightsNotice
        googleReviewUrl={safeGoogleUrl}
        compact={isPreview}
      />
    </div>
  );
}
