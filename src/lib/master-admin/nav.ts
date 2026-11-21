export type AdminSiteId =
  | "all"
  | "novastore"
  | "booking"
  | "aidoc"
  | "subkeeper"
  | "dimension";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  site?: AdminSiteId;
  description?: string;
};

export const ADMIN_SITES: Array<{
  id: AdminSiteId;
  label: string;
  short: string;
  href: string;
  externalUrl?: string;
}> = [
  {
    id: "all",
    label: "全域總覽 (All NovaOS Sites)",
    short: "全域總覽",
    href: "/admin/dashboard",
  },
  {
    id: "novastore",
    label: "NovaStore 賣場",
    short: "NovaStore",
    href: "/admin/novastore",
    externalUrl: "https://novastore-omega.vercel.app",
  },
  {
    id: "booking",
    label: "拓脈預約",
    short: "拓脈預約",
    href: "/admin/booking",
    externalUrl: "https://taiwanbiz.vercel.app",
  },
  {
    id: "aidoc",
    label: "Nova AI Doc",
    short: "AI Doc",
    href: "/admin/aidoc",
    externalUrl: "https://docmate-ai-one.vercel.app",
  },
  {
    id: "subkeeper",
    label: "訂閱管家",
    short: "訂閱管家",
    href: "/admin/subkeeper",
    externalUrl: "https://temporary-speedy-reef-cy4xhhu.vercel.app/app",
  },
  {
    id: "dimension",
    label: "拓維空間",
    short: "拓維空間",
    href: "/admin/dashboard?site=dimension",
    externalUrl: "https://novadimension.vercel.app",
  },
];

/** Product workspace URLs for admin dual-mode switching (not /admin analytics). */
export const PRODUCT_WORKSPACES: Array<{
  id: AdminSiteId;
  label: string;
  href: string;
}> = [
  {
    id: "novastore",
    label: "NovaStore 功能工作台",
    href: "https://novastore-omega.vercel.app/dashboard",
  },
  {
    id: "booking",
    label: "拓脈預約 功能工作台",
    href: "https://taiwanbiz.vercel.app/dashboard",
  },
  {
    id: "aidoc",
    label: "Nova AI Doc 功能工作台",
    href: "https://docmate-ai-one.vercel.app/dashboard",
  },
  {
    id: "subkeeper",
    label: "訂閱管家 功能工作台",
    href: "https://temporary-speedy-reef-cy4xhhu.vercel.app/app",
  },
  {
    id: "dimension",
    label: "拓維空間 前台首頁",
    href: "https://novadimension.vercel.app",
  },
];

export const ADMIN_NAV: AdminNavItem[] = [
  {
    href: "/admin/dashboard",
    label: "全域數據大廳",
    icon: "LayoutDashboard",
    site: "all",
    description: "跨站 KPI 與即時動態",
  },
  {
    href: "/admin/novastore",
    label: "NovaStore 賣場管理",
    icon: "ShoppingCart",
    site: "novastore",
    description: "對帳訂單與賣場狀態",
  },
  {
    href: "/admin/booking",
    label: "拓脈預約 排程與服務",
    icon: "CalendarDays",
    site: "booking",
    description: "預約日曆與服務項目",
  },
  {
    href: "/admin/aidoc",
    label: "Nova AI Doc 使用與額度",
    icon: "FileText",
    site: "aidoc",
    description: "文件用量與排行",
  },
  {
    href: "/admin/subkeeper",
    label: "訂閱管家 營運與提醒",
    icon: "CreditCard",
    site: "subkeeper",
    description: "個人訂閱與續訂提醒",
  },
  {
    href: "/admin/users",
    label: "全站會員與帳號管理",
    icon: "Users",
    description: "跨站帳號與方案",
  },
  {
    href: "/admin/settings",
    label: "全域系統與金流設定",
    icon: "Settings",
    description: "Admin、早鳥與金流入口",
  },
];

export function siteFromPath(pathname: string): AdminSiteId {
  if (pathname.startsWith("/admin/novastore")) return "novastore";
  if (pathname.startsWith("/admin/booking")) return "booking";
  if (pathname.startsWith("/admin/aidoc")) return "aidoc";
  if (pathname.startsWith("/admin/subkeeper")) return "subkeeper";
  return "all";
}
