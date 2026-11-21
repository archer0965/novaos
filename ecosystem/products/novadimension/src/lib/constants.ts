export const IG_PROFILE_URL =
  "https://www.instagram.com/nova.dimension?cplk=MnR4bXh5ZTVobW83";

export const IG_DM_URL = "https://ig.me/m/nova.dimension";

export const SPACE_TYPES = [
  "主臥室",
  "客廳",
  "小坪數套房",
  "工作室/辦公空間",
  "其他",
] as const;

export type SpaceType = (typeof SPACE_TYPES)[number];

/** 拓新雲端主站 NovaOS（可由環境變數覆寫） */
export const PARENT_SITE_URL =
  process.env.NEXT_PUBLIC_PARENT_SITE_URL ||
  process.env.NEXT_PUBLIC_NOVAOS_URL?.replace(/\/$/, "") ||
  "https://paycheck.com.de";

export const AI_STYLES = [
  { id: "cream-jp", label: "日系奶油風" },
  { id: "modern-minimal", label: "現代極簡風" },
  { id: "nordic-wood", label: "北歐木質風" },
  { id: "bauhaus", label: "包豪斯風" },
  { id: "industrial", label: "工業風" },
] as const;

export type AiStyleId = (typeof AI_STYLES)[number]["id"];

export const ROOM_TYPES = [
  { id: "living", label: "客廳" },
  { id: "bedroom", label: "臥室" },
  { id: "entry", label: "玄關" },
  { id: "dining", label: "餐廳" },
  { id: "study", label: "書房" },
] as const;

export type RoomTypeId = (typeof ROOM_TYPES)[number]["id"];

export type PricingPlanId =
  | "free"
  | "single"
  | "monthly"
  | "halfyear"
  | "yearly";

export type PricingPlan = {
  id: PricingPlanId;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlight?: boolean;
  cta: string;
  /** free plan does not call ECPay */
  paid: boolean;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "免費體驗",
    price: 0,
    period: "註冊送 1 次",
    description: "註冊即送 1 次 AI 生成，快速感受擬真效果。",
    features: ["1 次生成 Credit", "基礎空間分析", "標準解析度預覽"],
    cta: "免費試用 1 次",
    paid: false,
  },
  {
    id: "single",
    name: "單張體驗",
    price: 39,
    period: "/ 次",
    description: "單次解鎖高清擬真圖與完整分析報告。",
    features: ["1 次高清生成", "完整動線／採光報告", "可下載成果圖"],
    cta: "立即購買",
    paid: true,
  },
  {
    id: "monthly",
    name: "尊榮月繳",
    price: 299,
    period: "/ 月",
    description: "無限生成與優先算力，適合持續改造規劃。",
    features: ["無限生成", "優先算力佇列", "完整分析報告"],
    highlight: true,
    cta: "訂閱月繳",
    paid: true,
  },
  {
    id: "halfyear",
    name: "半年方案",
    price: 1614,
    period: "/ 半年",
    description: "半年暢用，享 9 折優惠。",
    features: ["半年無限生成", "優先算力", "享 9 折"],
    cta: "購買半年",
    paid: true,
  },
  {
    id: "yearly",
    name: "年繳方案",
    price: 3049,
    period: "/ 年",
    description: "全年暢用，享 85 折優惠。",
    features: ["全年無限生成", "最高優先算力", "享 85 折"],
    cta: "購買年繳",
    paid: true,
  },
];
