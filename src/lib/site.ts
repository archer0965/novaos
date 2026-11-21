/** Public contact / compliance config (safe for client via NEXT_PUBLIC_*). */

import { NOVA_BRAND } from "@/lib/novaos";

/** Permanent production host — never change without owner approval. */
export const PRODUCTION_HOST = "paycheck.com.de";
export const PRODUCTION_URL = `https://${PRODUCTION_HOST}`;

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return PRODUCTION_URL;
  return "http://localhost:3000";
}

export const siteConfig = {
  name: NOVA_BRAND.displayName,
  shortName: NOVA_BRAND.shortName,
  legalName: NOVA_BRAND.legalName,
  tagline: NOVA_BRAND.tagline,
  url: PRODUCTION_URL,
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "archer0965@gmail.com",
  lineOfficialUrl:
    process.env.NEXT_PUBLIC_LINE_OFFICIAL_URL ||
    "https://line.me/R/ti/p/@801rbtgm",
  companyAddress:
    process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "台灣（線上服務）",
  /**
   * Optional registered entity fields — leave empty until confirmed.
   * Set via env: NEXT_PUBLIC_COMPANY_LEGAL_NAME / NEXT_PUBLIC_COMPANY_TAX_ID
   */
  companyRegisteredName:
    process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME?.trim() || "",
  companyTaxId: process.env.NEXT_PUBLIC_COMPANY_TAX_ID?.trim() || "",
};
