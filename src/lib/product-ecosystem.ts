import type { NovaModuleId } from "@/lib/novaos";

export type ProductCard = {
  id: NovaModuleId | "hub";
  name: string;
  nameEn: string;
  tagline: string;
  audience: string;
  highlights: string[];
  advantage: string;
  ctaLabel: string;
  href: string;
  external?: boolean;
  badge?: string;
  accent: "cyan" | "amber" | "emerald" | "sky";
};

/** Commercial product matrix for the NovaOS brand hub. */
export const PRODUCT_ECOSYSTEM: ProductCard[] = [
  {
    id: "store",
    name: "NovaStore",
    nameEn: "Commerce OS",
    tagline: "代購／團購獨立賣場與自動對帳",
    audience: "代購主、團購主、IG／LINE 微型賣家",
    highlights: [
      "ATM 末五碼對帳與一鍵標記",
      "運費／滿額免運與外部導流（賣貨便／蝦皮）",
      "LINE 每日帳務彙整通知",
    ],
    advantage: "把「私訊收單＋手動對帳」變成可規模化的賣場流程",
    ctaLabel: "體驗 NovaStore",
    href: "https://novastore-omega.vercel.app",
    external: true,
    badge: "已獨立產品",
    accent: "amber",
  },
  {
    id: "booking",
    name: "拓脈預約",
    nameEn: "Nova Booking",
    tagline: "美業專屬極速預約與檔期管理",
    audience: "美甲、美睫、霧眉、私人工作室",
    highlights: ["10 秒完成預約", "防撞期與離峰折扣", "公開預約頁一鍵分享"],
    advantage: "減少空檔與重複確認，讓檔期自己排好",
    ctaLabel: "試用拓脈預約",
    href: "/signup?next=/dashboard/booking",
    accent: "cyan",
  },
  {
    id: "ai_doc",
    name: "Nova AI Doc",
    nameEn: "Document Intelligence",
    tagline: "AI 文件助理：摘要、問答與知識整理",
    audience: "需要處理合約、講義、報表的團隊與創作者",
    highlights: ["PDF 上傳即摘要", "依文件內容精準問答", "複習考題與筆記架構"],
    advantage: "把長文件變成可讀、可問、可複習的知識資產",
    ctaLabel: "體驗 AI 文件助理",
    href: "https://docmate-ai-one.vercel.app",
    external: true,
    badge: "獨立站",
    accent: "sky",
  },
  {
    id: "pass",
    name: "拓管 Nova Pass",
    nameEn: "Control Plane",
    tagline: "訂閱、對帳與推薦碼的營運中控",
    audience: "所有拓新雲端用戶（永久免費）",
    highlights: ["訂閱續費總覽", "對帳與通知設定", "同業推薦現折"],
    advantage: "免費掌控帳務與成長槓桿，不需另購模組",
    ctaLabel: "進入拓管",
    href: "/signup?next=/dashboard/pass",
    badge: "永久免費",
    accent: "emerald",
  },
];

export const WHY_CHOOSE_US = [
  {
    title: "資料安全優先",
    body: "身分驗證與資料列層級權限（RLS）分開設計，賣家只看得到自己的營運資料。",
  },
  {
    title: "極速穩定交付",
    body: "Edge 部署與精簡前端負載，讓預約頁、賣場與後台在尖峰仍保持流暢。",
  },
  {
    title: "自動化整合能力",
    body: "從對帳、通知到日常帳務彙整，把重複人工作業收斂成可排程的系統流程。",
  },
] as const;
