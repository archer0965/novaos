import { NOVA_MODULES, NOVA_MODULE_IDS, type NovaModuleId } from "@/lib/novaos";

export type NavMode = "hub" | NovaModuleId;

export type NavItem = {
  href: string;
  label: string;
  emoji?: string;
  description?: string;
  /** Highlight when pathname matches */
  match?: "exact" | "prefix";
};

export const NOVAOS_HUB_HREF = "/dashboard";

/** Marketing / hub master menu (public + signed-in overview). */
export const HUB_MASTER_MENU: {
  title: string;
  items: NavItem[];
}[] = [
  {
    title: "NovaOS 總覽",
    items: [
      {
        href: "/",
        label: "拓新雲端 NovaOS 首頁",
        emoji: "🏠",
        match: "exact",
      },
      {
        href: "/dashboard",
        label: "總控台",
        emoji: "🖥️",
        match: "exact",
        description: "登入後的營運總覽",
      },
    ],
  },
  {
    title: "子模組（拓管永久免費）",
    items: NOVA_MODULE_IDS.map((id) => ({
      href: NOVA_MODULES[id].href,
      label: `${NOVA_MODULES[id].emoji} ${NOVA_MODULES[id].name}${
        id === "pass" ? "｜免費" : ""
      }`,
      description: NOVA_MODULES[id].blurb,
      match: "prefix" as const,
    })),
  },
  {
    title: "方案與支援",
    items: [
      {
        href: "/#pricing",
        label: "方案定價",
        emoji: "💳",
      },
      {
        href: "/contact",
        label: "客服諮詢",
        emoji: "💬",
        description: "表單或官方 LINE",
      },
    ],
  },
];

/** Per-module feature shortcuts (middle block of sub-module drawer). */
export const MODULE_FEATURE_MENUS: Record<NovaModuleId, NavItem[]> = {
  booking: [
    { href: "/dashboard/booking", label: "預約總覽", emoji: "📅", match: "exact" },
    {
      href: "/dashboard/booking/services",
      label: "新增服務項目",
      emoji: "➕",
      match: "prefix",
    },
  ],
  store: [
    { href: "/dashboard/store", label: "商店中心", emoji: "💰", match: "exact" },
    {
      href: "/dashboard/store/create",
      label: "建立商品",
      emoji: "🛍️",
      match: "prefix",
    },
    { href: "/dashboard/orders", label: "訂單管理", emoji: "📦", match: "prefix" },
    { href: "/dashboard/coupons", label: "優惠券", emoji: "🎟️", match: "prefix" },
    {
      href: "/dashboard/store/stats",
      label: "銷售統計",
      emoji: "📊",
      match: "prefix",
    },
  ],
  ai_doc: [
    {
      href: "/dashboard/ai-doc",
      label: "文件產生與問答",
      emoji: "📄",
      match: "prefix",
    },
  ],
  pass: [
    { href: "/dashboard/pass", label: "訂閱中控", emoji: "⚙️", match: "exact" },
    {
      href: "/dashboard/pass#upgrade",
      label: "方案升級",
      emoji: "🚀",
    },
    {
      href: "/dashboard/pass#referral",
      label: "同業推薦碼",
      emoji: "🔗",
    },
    {
      href: "/dashboard/subkeeper",
      label: "訂閱管家",
      emoji: "📒",
      match: "prefix",
    },
    {
      href: "/dashboard/settings",
      label: "帳戶設定",
      emoji: "👤",
      match: "prefix",
    },
  ],
};

export function resolveNavMode(pathname: string): NavMode {
  if (pathname.startsWith("/dashboard/booking")) return "booking";
  if (
    pathname.startsWith("/dashboard/store") ||
    pathname.startsWith("/dashboard/orders") ||
    pathname.startsWith("/dashboard/coupons") ||
    pathname.startsWith("/dashboard/analytics")
  ) {
    return "store";
  }
  if (pathname.startsWith("/dashboard/ai-doc")) return "ai_doc";
  if (
    pathname.startsWith("/dashboard/pass") ||
    pathname.startsWith("/dashboard/subkeeper") ||
    pathname.startsWith("/dashboard/settings")
  ) {
    return "pass";
  }
  // /dashboard, /dashboard/admin, marketing pages → hub
  return "hub";
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  const hrefPath = item.href.split("#")[0] || "/";
  if (item.match === "exact") {
    return pathname === hrefPath;
  }
  if (item.match === "prefix") {
    if (hrefPath === "/") return pathname === "/";
    if (hrefPath === "/dashboard") return pathname === "/dashboard";
    return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
  }
  // default: exact for hub home-ish, prefix otherwise
  if (hrefPath === "/" || hrefPath === "/dashboard") {
    return pathname === hrefPath;
  }
  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}

export function moduleTitle(mode: NavMode): string {
  if (mode === "hub") return "拓新雲端 NovaOS";
  return `${NOVA_MODULES[mode].emoji} ${NOVA_MODULES[mode].name}`;
}
