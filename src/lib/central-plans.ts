/**
 * Central plan catalog for NovaOS ecosystem.
 *
 * Authority (owner 2026-11-22):
 * - NovaStore + 拓脈預約 → follow NovaOS hub prices
 * - DocMate AI → follow DocMate site prices
 * - SubKeeper → free / local (no paid plans confirmed)
 */

export type CentralProductId =
  | "hub"
  | "novastore"
  | "booking"
  | "docmate"
  | "dimension"
  | "subkeeper";

export type CentralPlanRow = {
  product_id: CentralProductId;
  product_name: string;
  product_url: string;
  plan_id: string;
  plan_name: string;
  monthly_price: number;
  half_yearly_price: number | null;
  yearly_price: number | null;
  trial_days: number;
  usage_limits: Record<string, number | string>;
  feature_list: string[];
  discount_rules: string;
  product_status: "active" | "beta" | "deprecated";
  authority: "novaos-hub" | "docmate-site" | "dimension-site" | "local-free";
  notes?: string;
};

/** NovaOS hub base prices for store/booking/bundle */
const HUB_STARTER = {
  monthly: 299,
  half_yearly: 1794,
  yearly: 3588,
} as const;

const HUB_FLAGSHIP = {
  monthly: 499,
  half_yearly: 2994,
  yearly: 5988,
} as const;

export const CENTRAL_PLANS: CentralPlanRow[] = [
  {
    product_id: "novastore",
    product_name: "NovaStore",
    product_url: "https://novastore-omega.vercel.app",
    plan_id: "free",
    plan_name: "免費版",
    monthly_price: 0,
    half_yearly_price: 0,
    yearly_price: 0,
    trial_days: 7,
    usage_limits: { monthly_orders: 15 },
    feature_list: ["基礎賣場", "ATM 末五碼回報"],
    discount_rules: "無",
    product_status: "active",
    authority: "novaos-hub",
    notes: "免費額度為產品站規格；付費價對齊 NovaOS",
  },
  {
    product_id: "novastore",
    product_name: "NovaStore",
    product_url: "https://novastore-omega.vercel.app",
    plan_id: "starter",
    plan_name: "專業版",
    monthly_price: HUB_STARTER.monthly,
    half_yearly_price: HUB_STARTER.half_yearly,
    yearly_price: HUB_STARTER.yearly,
    trial_days: 7,
    usage_limits: { monthly_orders: "unlimited" },
    feature_list: ["無限筆數", "LINE 通知", "優惠券"],
    discount_rules: "早鳥／特約對齊 NovaOS（特約月 9／半年 82／年 75 折）",
    product_status: "active",
    authority: "novaos-hub",
  },
  {
    product_id: "novastore",
    product_name: "NovaStore",
    product_url: "https://novastore-omega.vercel.app",
    plan_id: "pro",
    plan_name: "旗艦版",
    monthly_price: HUB_FLAGSHIP.monthly,
    half_yearly_price: HUB_FLAGSHIP.half_yearly,
    yearly_price: HUB_FLAGSHIP.yearly,
    trial_days: 7,
    usage_limits: { monthly_orders: "unlimited" },
    feature_list: ["旗艦功能"],
    discount_rules: "早鳥／特約對齊 NovaOS",
    product_status: "active",
    authority: "novaos-hub",
  },
  {
    product_id: "booking",
    product_name: "拓脈預約",
    product_url: "https://taiwanbiz.vercel.app",
    plan_id: "starter",
    plan_name: "基礎版",
    monthly_price: HUB_STARTER.monthly,
    half_yearly_price: HUB_STARTER.half_yearly,
    yearly_price: HUB_STARTER.yearly,
    trial_days: 7,
    usage_limits: {},
    feature_list: ["預約檔期", "LINE 通知"],
    discount_rules: "對齊 NovaOS；創始店家細節待獨立站原始碼",
    product_status: "active",
    authority: "novaos-hub",
    notes: "獨立站無 Git；權威價格以 hub 為準",
  },
  {
    product_id: "booking",
    product_name: "拓脈預約",
    product_url: "https://taiwanbiz.vercel.app",
    plan_id: "unlimited",
    plan_name: "旗艦版",
    monthly_price: HUB_FLAGSHIP.monthly,
    half_yearly_price: HUB_FLAGSHIP.half_yearly,
    yearly_price: HUB_FLAGSHIP.yearly,
    trial_days: 7,
    usage_limits: {},
    feature_list: ["旗艦預約功能"],
    discount_rules: "對齊 NovaOS",
    product_status: "active",
    authority: "novaos-hub",
  },
  {
    product_id: "docmate",
    product_name: "DocMate AI",
    product_url: "https://docmate-ai-one.vercel.app",
    plan_id: "free",
    plan_name: "FREE",
    monthly_price: 0,
    half_yearly_price: 0,
    yearly_price: 0,
    trial_days: 0,
    usage_limits: { documents: 3, questions: 20 },
    feature_list: ["基礎摘要", "基礎問答"],
    discount_rules: "無",
    product_status: "active",
    authority: "docmate-site",
  },
  {
    product_id: "docmate",
    product_name: "DocMate AI",
    product_url: "https://docmate-ai-one.vercel.app",
    plan_id: "pro",
    plan_name: "PRO",
    monthly_price: 199,
    half_yearly_price: 1194,
    yearly_price: 2388,
    trial_days: 0,
    usage_limits: { documents: 50, questions: 500 },
    feature_list: ["進階摘要", "問答"],
    discount_rules: "早鳥／一般／大使（規則可與全站折扣對齊，價目以 DocMate 為準）",
    product_status: "active",
    authority: "docmate-site",
  },
  {
    product_id: "docmate",
    product_name: "DocMate AI",
    product_url: "https://docmate-ai-one.vercel.app",
    plan_id: "business",
    plan_name: "BUSINESS",
    monthly_price: 499,
    half_yearly_price: 2994,
    yearly_price: 5988,
    trial_days: 0,
    usage_limits: { documents: 200, questions: 2000 },
    feature_list: ["高額度", "優先處理"],
    discount_rules: "早鳥／一般／大使",
    product_status: "active",
    authority: "docmate-site",
  },
  {
    product_id: "dimension",
    product_name: "拓維空間",
    product_url: "https://novadimension.vercel.app",
    plan_id: "trial",
    plan_name: "免費體驗",
    monthly_price: 0,
    half_yearly_price: 0,
    yearly_price: 0,
    trial_days: 0,
    usage_limits: { credits: 1 },
    feature_list: ["註冊送 1 次 AI 生成", "基礎空間分析"],
    discount_rules: "無",
    product_status: "active",
    authority: "dimension-site",
  },
  {
    product_id: "dimension",
    product_name: "拓維空間",
    product_url: "https://novadimension.vercel.app",
    plan_id: "single",
    plan_name: "單張體驗",
    monthly_price: 39,
    half_yearly_price: null,
    yearly_price: null,
    trial_days: 0,
    usage_limits: { credits: 1 },
    feature_list: ["1 次高清生成", "完整動線／採光報告"],
    discount_rules: "單次購買",
    product_status: "active",
    authority: "dimension-site",
    notes: "價目以 novadimension.vercel.app 為準",
  },
  {
    product_id: "dimension",
    product_name: "拓維空間",
    product_url: "https://novadimension.vercel.app",
    plan_id: "monthly",
    plan_name: "尊榮月繳",
    monthly_price: 299,
    half_yearly_price: 1614,
    yearly_price: null,
    trial_days: 0,
    usage_limits: { credits: "unlimited" },
    feature_list: ["無限生成", "優先算力"],
    discount_rules: "半年方案享 9 折（以該站為準）",
    product_status: "active",
    authority: "dimension-site",
  },
  {
    product_id: "hub",
    product_name: "拓新雲端 NovaOS",
    product_url: "https://paycheck.com.de",
    plan_id: "unlimited",
    plan_name: "旗艦全家桶",
    monthly_price: HUB_FLAGSHIP.monthly,
    half_yearly_price: HUB_FLAGSHIP.half_yearly,
    yearly_price: HUB_FLAGSHIP.yearly,
    trial_days: 7,
    usage_limits: { modules: "booking+store+ai_doc" },
    feature_list: ["拓脈＋NovaStore＋DocMate", "訂閱中控免費"],
    discount_rules: "早鳥／一般／特約／大使",
    product_status: "active",
    authority: "novaos-hub",
  },
  {
    product_id: "subkeeper",
    product_name: "SubKeeper",
    product_url: "https://temporary-speedy-reef-cy4xhhu.vercel.app",
    plan_id: "free",
    plan_name: "免費（本機）",
    monthly_price: 0,
    half_yearly_price: 0,
    yearly_price: 0,
    trial_days: 0,
    usage_limits: { storage: "localStorage" },
    feature_list: ["免登入", "本機保存訂閱"],
    discount_rules: "無",
    product_status: "active",
    authority: "local-free",
  },
];

export function plansByAuthority(authority: CentralPlanRow["authority"]) {
  return CENTRAL_PLANS.filter((p) => p.authority === authority);
}
