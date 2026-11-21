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
      "獨立賣場頁一鍵分享，買家自助瀏覽與下單",
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
    nameEn: "Nova Crest Pulse",
    tagline: "美業與美髮極速預約官網",
    audience: "美容美甲、美髮沙龍、私人工作室",
    highlights: [
      "防撞期排班與離峰自動折扣",
      "LINE 即時通知",
      "創始店家優惠，開店即可接單",
    ],
    advantage: "減少空檔與重複確認，讓檔期自己排好",
    ctaLabel: "試用拓脈預約",
    href: "https://taiwanbiz.vercel.app",
    external: true,
    badge: "獨立站",
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
    name: "拓管",
    nameEn: "SubKeeper",
    tagline: "個人訂閱開銷總管與退訂提醒",
    audience: "需要掌握月費訂閱、避免忘記扣款的個人用戶",
    highlights: [
      "免登入，資料保存在本機瀏覽器",
      "訂閱開銷總覽與週期追蹤",
      "扣款前 3 天行事曆提醒可匯出",
    ],
    advantage: "重新開啟或網站更新也不丟資料，輕量掌握每一筆訂閱",
    ctaLabel: "進入拓管",
    href: "https://temporary-speedy-reef-cy4xhhu.vercel.app",
    external: true,
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
