const SHOP_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;
const LINE_ID_BODY_REGEX = /^[a-zA-Z0-9._-]{2,60}$/;
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_DATA_IMAGE_REGEX =
  /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

export const BRAND_COLOR_PRESETS = [
  { name: "琥珀金（預設）", hex: "#F59E0B" },
  { name: "曜石黑", hex: "#0F172A" },
  { name: "暖磚紅", hex: "#E11D48" },
  { name: "森木綠", hex: "#059669" },
  { name: "海灣藍", hex: "#2563EB" },
  { name: "質感紫", hex: "#7C3AED" },
];

export function sanitizeShopId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!SHOP_ID_REGEX.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function normalizeLineOfficialId(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const withoutAt = trimmed.replace(/^@+/, "");
  if (!withoutAt) return "";
  return `@${withoutAt}`;
}

export function isValidLineOfficialId(raw: string): boolean {
  const normalized = normalizeLineOfficialId(raw);
  if (!normalized.startsWith("@")) return false;
  return LINE_ID_BODY_REGEX.test(normalized.slice(1));
}

export function isValidEmail(raw: string): boolean {
  return EMAIL_REGEX.test(raw.trim());
}

export function getSafeBrandColor(raw?: string): string {
  const trimmed = raw?.trim() ?? "";
  return HEX_COLOR_REGEX.test(trimmed) ? trimmed : "#F59E0B";
}

export function isSafeHttpUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function isSafeImageSrc(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }
  if (SAFE_DATA_IMAGE_REGEX.test(trimmed)) {
    return true;
  }
  return isSafeHttpUrl(trimmed);
}

export function isAllowedEmailEndpoint(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    return (
      parsed.hostname === "formspree.io" ||
      parsed.hostname === "api.web3forms.com"
    );
  } catch {
    return false;
  }
}

export function getSafeExternalUrl(rawUrl: string, fallback: string): string {
  const trimmed = rawUrl.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch {
    // ignore invalid URL
  }
  return fallback;
}
