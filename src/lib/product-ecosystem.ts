import type { NovaModuleId } from "@/lib/novaos";
import { SUBKEEPER_PRODUCT } from "@/lib/subkeeper";

export type ProductCard = {
  id: NovaModuleId | "hub" | "novashield" | "dimension" | "subkeeper";
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
  accent: "cyan" | "amber" | "emerald" | "sky" | "rose";
};

/** Commercial product matrix for the NovaOS brand hub. */
export const PRODUCT_ECOSYSTEM: ProductCard[] = [
  {
    id: "store",
    name: "NovaStore",
    nameEn: "Commerce OS",
    tagline: "3 分鐘建立 IG 專屬獨立賣場與自動對帳",
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
    tagline: "美業與美髮工作室的極速預約官網",
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
    id: "novashield",
    name: "Nova商譽寶",
    nameEn: "NovaShield",
    tagline: "門市 5 星商譽的第一道防線：好評引導 Google Maps，客訴私訊 LINE 溫柔解決",
    audience: "餐飲、美業、診所與所有重視 Google 評價的實體門市",
    highlights: [
      "4–5 星滿意顧客一鍵引導至 Google Maps 留好評",
      "1–3 星負評喚起 LINE 官方帳號私訊或 Email 通知即時處理",
      "預設保留公開評論連結，符合《公平交易法》與 Google 規範",
      "免費版 $0 永久使用；專業版 NT$199／月（年繳 NT$1,990）",
    ],
    advantage: "把「被動等 1 星負評」變成「離店前化解客訴、穩定累積 5 星口碑」",
    ctaLabel: "體驗 Nova商譽寶",
    href: "https://novashield-mauve.vercel.app",
    external: true,
    badge: "獨立站",
    accent: "sky",
  },
  {
    id: "dimension",
    name: "拓維空間",
    nameEn: "NovaDimension AI",
    tagline: "不用大興土木，用 AI 擬真預覽打造理想生活空間",
    audience: "想改造房間氛圍的屋主、租屋族與軟裝靈感探索者",
    highlights: [
      "上傳房間照片，約 30 秒產出 AI 軟裝擬真預覽圖",
      "動線規劃與採光分析報告",
      "多種風格可選（奶油／極簡／北歐等）",
      "綠界 ECPay 單次 Credit 或月繳暢用",
    ],
    advantage: "把「空想軟裝」變成可比較 Before／After 的擬真決策工具",
    ctaLabel: "體驗拓維空間",
    href: "https://novadimension.vercel.app",
    external: true,
    badge: "獨立站",
    accent: "rose",
  },
  {
    id: "subkeeper",
    name: SUBKEEPER_PRODUCT.name,
    nameEn: "Personal Subscription Tracker",
    tagline: SUBKEEPER_PRODUCT.tagline,
    audience: "需要掌握月費訂閱、避免忘記扣款的個人用戶",
    highlights: [
      "永久免費使用（無需付費方案）",
      "集中管理所有訂閱項目",
      "續訂提醒與該月費用彙整",
      "讓財務狀況一目了然",
    ],
    advantage: "智慧訂閱管理 × 雲端助手，財務狀況一目了然",
    ctaLabel: `免費使用${SUBKEEPER_PRODUCT.name}`,
    href: SUBKEEPER_PRODUCT.siteUrl,
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
