/**
 * 拓新雲端 NovaOS — Legal / Terms center (single source of truth).
 * Sister product sites can deep-link to hub paths under PRODUCTION_URL.
 */

import { PRODUCTION_URL, siteConfig } from "@/lib/site";

/** Display date for all legal docs (update when revising content). */
export const LEGAL_LAST_UPDATED = "2026 年 11 月 22 日";
export const LEGAL_LAST_UPDATED_ISO = "2026-11-22";

/** Shared copy: payment proof (no uniform invoice while unincorporated). */
export const LEGAL_PAYMENT_PROOF_NOTICE =
  "本服務目前為個人/團隊獨立營運，尚未設立公司，暫無開立統一發票服務。使用者完成付款後，系統與綠界金流將提供電子交易明細與付款成功紀錄作為憑證。未來若依營運發展或中華民國法令規定辦理公司設立與商業登記，相關發票開立事宜將另行於本網站公告並依規定辦理。";

/** Products / services covered by NovaOS legal documents. */
export const LEGAL_COVERED_SERVICES = [
  { name: "拓新雲端 NovaOS", note: "總站帳號、訂閱中控與產品矩陣入口" },
  { name: "NovaStore", note: "賣場、對帳與訂單相關工具" },
  { name: "拓脈預約", note: "美業／服務業預約與檔期工具" },
  { name: "Nova AI Doc", note: "AI 文件摘要、問答與知識整理" },
  { name: "拓維空間（NovaDimension AI）", note: "AI 軟裝空間改造與擬真渲染" },
  { name: "SubKeeper", note: "個人訂閱費用管理與扣款提醒（本機保存）" },
] as const;

export type LegalDocId =
  | "index"
  | "terms"
  | "privacy"
  | "refund"
  | "disclaimer";

export type LegalDocMeta = {
  id: LegalDocId;
  href: string;
  title: string;
  shortTitle: string;
  description: string;
  /** Omit from footer/nav chips when true (index only). */
  indexOnly?: boolean;
};

export const LEGAL_DOCS: LegalDocMeta[] = [
  {
    id: "index",
    href: "/legal",
    title: "條款與法律中心",
    shortTitle: "法律中心",
    description: "一次查看拓新雲端 NovaOS 全部條款與政策文件。",
    indexOnly: true,
  },
  {
    id: "terms",
    href: "/terms",
    title: "服務條款",
    shortTitle: "服務條款",
    description:
      "帳號規範、服務範圍、禁止事項、智慧財產與準據法。",
  },
  {
    id: "privacy",
    href: "/privacy",
    title: "隱私權政策",
    shortTitle: "隱私權政策",
    description:
      "個人資料蒐集、使用、保存、第三方處理者與當事人權利（個資法）。",
  },
  {
    id: "refund",
    href: "/refund",
    title: "付費與退款政策",
    shortTitle: "付費／退款",
    description:
      "訂閱計費、綠界金流、取消續訂、退款原則與異常處理。",
  },
  {
    id: "disclaimer",
    href: "/disclaimer",
    title: "免責聲明",
    shortTitle: "免責聲明",
    description:
      "系統輔助性質、責任限制、第三方服務與內容正確性說明。",
  },
];

export const LEGAL_DOC_LINKS = LEGAL_DOCS.filter((d) => !d.indexOnly);

/** Absolute hub URLs for sister sites / shared footers. */
export function legalHubUrl(path: string = "/legal"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${PRODUCTION_URL}${normalized}`;
}

export function legalOperatorLines(): string[] {
  const lines: string[] = [];
  lines.push(`品牌／服務名稱：${siteConfig.legalName}`);
  if (siteConfig.companyRegisteredName) {
    lines.push(`正式公司名稱：${siteConfig.companyRegisteredName}`);
  } else {
    lines.push("正式公司名稱：（待補）");
  }
  if (siteConfig.companyTaxId) {
    lines.push(`統一編號：${siteConfig.companyTaxId}`);
  } else {
    lines.push("統一編號：（待補）");
  }
  lines.push(`服務地址／營運地區：${siteConfig.companyAddress}`);
  return lines;
}
