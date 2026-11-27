/**
 * Central plan catalog for NovaOS ecosystem.
 *
 * Authority (unified member / pricing policy):
 * - Payment path: paid upgrades → NovaOS hub ECPay callback (backend only)
 * - Prices / early-bird / trial / discounts: hub is the single source of truth
 * - Product sites may display catalog but must not diverge; sync from this file / pricing-tiers
 * - 訂閱管家 → permanent free
 */

export type CentralProductId =
  | "hub"
  | "novastore"
  | "booking"
  | "novashield"
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
  authority:
    | "novaos-hub"
    | "docmate-site"
    | "dimension-site"
    | "novashield-site"
    | "local-free";
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

const ALL_CENTRAL_PLANS: CentralPlanRow[] = [
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
    product_name: "Nova AI Doc",
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
    authority: "novaos-hub",
    notes: "價目與折扣以主站為準；子站僅顯示",
  },
  {
    product_id: "docmate",
    product_name: "Nova AI Doc",
    product_url: "https://docmate-ai-one.vercel.app",
    plan_id: "pro",
    plan_name: "PRO",
    monthly_price: 199,
    half_yearly_price: 1194,
    yearly_price: 2388,
    trial_days: 0,
    usage_limits: { documents: 50, questions: 500 },
    feature_list: ["進階摘要", "問答"],
    discount_rules: "早鳥／一般／大使（對齊主站 pricing-tiers）",
    product_status: "active",
    authority: "novaos-hub",
  },
  {
    product_id: "docmate",
    product_name: "Nova AI Doc",
    product_url: "https://docmate-ai-one.vercel.app",
    plan_id: "business",
    plan_name: "BUSINESS",
    monthly_price: 499,
    half_yearly_price: 2994,
    yearly_price: 5988,
    trial_days: 0,
    usage_limits: { documents: 200, questions: 2000 },
    feature_list: ["高額度", "優先處理", "團隊功能"],
    discount_rules: "早鳥／一般／大使（對齊主站）",
    product_status: "active",
    authority: "novaos-hub",
  },
  {
    product_id: "novashield",
    product_name: "Nova商譽寶",
    product_url: "https://novashield-mauve.vercel.app",
    plan_id: "free",
    plan_name: "免費體驗版",
    monthly_price: 0,
    half_yearly_price: 0,
    yearly_price: 0,
    trial_days: 0,
    usage_limits: {},
    feature_list: ["單一總體星等評分", "Google Maps 好評引導", "Email 客訴通知"],
    discount_rules: "永久免費",
    product_status: "active",
    authority: "novashield-site",
    notes: "獨立微服務，不含於旗艦全家桶",
  },
  {
    product_id: "novashield",
    product_name: "Nova商譽寶",
    product_url: "https://novashield-mauve.vercel.app",
    plan_id: "pro",
    plan_name: "專業版 Pro",
    monthly_price: 199,
    half_yearly_price: null,
    yearly_price: 1990,
    trial_days: 0,
    usage_limits: {},
    feature_list: [
      "LINE 官方帳號 Deep Link 私訊引導",
      "多維度自訂評分",
      "品牌 Logo 與主題色",
      "自訂分流星等門檻",
    ],
    discount_rules: "年繳省 NT$398（獨立微服務，走本站綠界 ECPay）",
    product_status: "active",
    authority: "novashield-site",
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
    feature_list: ["登入贈 1 次 AI 擬真預覽", "基礎空間分析"],
    discount_rules: "無",
    product_status: "active",
    authority: "novaos-hub",
    notes: "Credit 方案登錄於主站目錄；付款回調應由 hub 授權",
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
    authority: "novaos-hub",
  },
  {
    product_id: "dimension",
    product_name: "拓維空間",
    product_url: "https://novadimension.vercel.app",
    plan_id: "monthly",
    plan_name: "尊榮月繳",
    monthly_price: 299,
    half_yearly_price: 1614,
    yearly_price: 3049,
    trial_days: 0,
    usage_limits: { credits: "unlimited" },
    feature_list: ["無限生成", "優先算力"],
    discount_rules: "年繳對齊主站一般資格約 85 折顯示價",
    product_status: "active",
    authority: "novaos-hub",
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
    usage_limits: { modules: "booking+store" },
    feature_list: ["拓脈＋NovaStore 雙模組", "訂閱中控免費"],
    discount_rules: "早鳥／一般／特約店家",
    product_status: "active",
    authority: "novaos-hub",
  },
  {
    product_id: "subkeeper",
    product_name: "訂閱管家",
    product_url: "https://temporary-speedy-reef-cy4xhhu.vercel.app",
    plan_id: "free",
    plan_name: "免費",
    monthly_price: 0,
    half_yearly_price: 0,
    yearly_price: 0,
    trial_days: 0,
    usage_limits: { storage: "localStorage" },
    feature_list: ["訂閱開銷總覽", "扣款提醒"],
    discount_rules: "無",
    product_status: "active",
    authority: "local-free",
    notes: "正式網址 temporary-speedy-reef-cy4xhhu.vercel.app",
  },
];

/** 已停止提供的產品（Nova AI Doc）不列入對外目錄。 */
export const CENTRAL_PLANS: CentralPlanRow[] = ALL_CENTRAL_PLANS.filter(
  (p) => p.product_id !== "docmate"
);

export function plansByAuthority(authority: CentralPlanRow["authority"]) {
  return CENTRAL_PLANS.filter((p) => p.authority === authority);
}
