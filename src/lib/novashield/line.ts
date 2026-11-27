import type { DimensionScore, LineDeepLinkResult } from "./types";
import { isValidLineOfficialId, normalizeLineOfficialId } from "./validation";

export interface BuildLineDeepLinkInput {
  lineOfficialId: string;
  shopName: string;
  rating: number;
  exactAverage?: number;
  dimensions?: DimensionScore[];
  suggestion: string;
  customerName?: string;
  phone?: string;
}

export function renderStarString(rating: number): string {
  const clamped = Math.max(1, Math.min(5, Math.round(rating)));
  return "★".repeat(clamped) + "☆".repeat(5 - clamped);
}

export function buildLinePrefillMessage(input: BuildLineDeepLinkInput): string {
  const rounded = Math.max(1, Math.min(5, Math.round(input.rating)));
  const avgSuffix =
    typeof input.exactAverage === "number" && input.exactAverage !== rounded
      ? `（平均 ${input.exactAverage.toFixed(1)}）`
      : "";

  const lines: string[] = [
    `【${input.shopName} 顧客體驗回饋】`,
    `綜合評分：${renderStarString(rounded)} ${rounded} 星${avgSuffix}`,
  ];

  if (input.dimensions && input.dimensions.length > 1) {
    lines.push(
      `分項評分：${input.dimensions.map((d) => `${d.label} ${d.score}★`).join("、")}`,
    );
  }

  lines.push(`改善建議：${input.suggestion.trim()}`);

  if (input.customerName?.trim()) {
    lines.push(`聯絡姓名：${input.customerName.trim()}`);
  }
  if (input.phone?.trim()) {
    lines.push(`聯絡電話：${input.phone.trim()}`);
  }

  return lines.join("\n");
}

export function buildLineDeepLink(
  input: BuildLineDeepLinkInput,
): LineDeepLinkResult {
  const rawNormalized = normalizeLineOfficialId(input.lineOfficialId);
  const normalizedId = isValidLineOfficialId(rawNormalized)
    ? rawNormalized
    : "@ourshop";
  const messageText = buildLinePrefillMessage(input);
  const encodedMessage = encodeURIComponent(messageText);
  const deepLinkUrl = `https://line.me/R/oaMessage/${normalizedId}/?${encodedMessage}`;

  return {
    lineOfficialId: normalizedId,
    messageText,
    deepLinkUrl,
  };
}
