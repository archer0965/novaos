/**
 * Central plan catalog for NovaOS ecosystem (single source for hub display).
 * Sister sites should eventually import or fetch this — do not silently change
 * live prices without owner confirmation when conflicts exist.
 */

export type CentralProductId =
  | "hub"
  | "novastore"
  | "booking"
  | "docmate"
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
  /** When true, numbers differ across sites — owner must confirm authority */
  needsOwnerConfirm?: boolean;
  notes?: string;
};

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
    notes: "獨立站 PRICING_CONFIG.free.monthlyQuota=15",
  },
  {
    product_id: "novastore",
    product_name: "NovaStore",
    product_url: "https://novastore-omega.vercel.app",
    plan_id: "starter",
    plan_name: "專業版",
    monthly_price: 299,
    half_yearly_price: 1610,
    yearly_price: 2990,
    trial_days: 7,
    usage_limits: { monthly_orders: "unlimited" },
    feature_list: ["無限筆數", "LINE 通知", "優惠券"],
    discount_rules: "早鳥／特約另計",
    product_status: "active",
    needsOwnerConfirm: true,
    notes: "Hub starter half/year base 1794/3588 與獨立站不同，待確認權威來源",
  },
  {
    product_id: "novastore",
    product_name: "NovaStore",
    product_url: "https://novastore-omega.vercel.app",
    plan_id: "pro",
    plan_name: "旗艦版",
    monthly_price: 499,
    half_yearly_price: 2690,
    yearly_price: 4990,
    trial_days: 7,
    usage_limits: { monthly_orders: "unlimited" },
    feature_list: ["旗艦功能", "分析（行銷宣稱需對齊實作）"],
    discount_rules: "早鳥／特約另計",
    product_status: "active",
    needsOwnerConfirm: true,
  },
  {
    product_id: "booking",
    product_name: "拓脈預約",
    product_url: "https://taiwanbiz.vercel.app",
    plan_id: "starter",
    plan_name: "基礎版",
    monthly_price: 299,
    half_yearly_price: null,
    yearly_price: null,
    trial_days: 7,
    usage_limits: {},
    feature_list: ["預約檔期", "LINE 通知"],
    discount_rules: "創始店家優惠 — 待獨立站原始碼確認",
    product_status: "active",
    needsOwnerConfirm: true,
    notes: "獨立站原始碼未取得；數字暫對齊 hub",
  },
  {
    product_id: "booking",
    product_name: "拓脈預約",
    product_url: "https://taiwanbiz.vercel.app",
    plan_id: "unlimited",
    plan_name: "旗艦版",
    monthly_price: 499,
    half_yearly_price: null,
    yearly_price: null,
    trial_days: 7,
    usage_limits: {},
    feature_list: ["旗艦預約功能"],
    discount_rules: "待確認",
    product_status: "active",
    needsOwnerConfirm: true,
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
    feature_list: ["進階摘要", "問答", "考題行銷文案待實作或下架"],
    discount_rules: "早鳥／一般／大使",
    product_status: "active",
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
  },
  {
    product_id: "hub",
    product_name: "拓新雲端 NovaOS",
    product_url: "https://paycheck.com.de",
    plan_id: "unlimited",
    plan_name: "旗艦全家桶",
    monthly_price: 499,
    half_yearly_price: 2994,
    yearly_price: 5988,
    trial_days: 7,
    usage_limits: { modules: "booking+store+ai_doc" },
    feature_list: ["拓脈＋NovaStore＋DocMate", "訂閱中控免費"],
    discount_rules: "早鳥／一般／特約／大使",
    product_status: "active",
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
    notes: "獨立站原始碼未取得；公開定位為免登入",
  },
];

export function plansNeedingOwnerConfirm(): CentralPlanRow[] {
  return CENTRAL_PLANS.filter((p) => p.needsOwnerConfirm);
}
