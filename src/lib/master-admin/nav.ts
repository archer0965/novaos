export type AdminSiteId =
  | "overview"
  | "novastore"
  | "booking"
  | "novashield"
  | "aidoc"
  | "subkeeper"
  | "dimension"
  | "users"
  | "settings";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  id: AdminSiteId;
};

export type AdminProductMeta = {
  id: Exclude<
    AdminSiteId,
    "overview" | "users" | "settings"
  >;
  label: string;
  short: string;
  href: string;
  /** Public marketing / product site */
  publicUrl: string;
  /** Product-native ops console (separate site admin) */
  opsUrl: string;
  opsLabel: string;
  blurb: string;
  accent: "amber" | "cyan" | "sky" | "emerald" | "rose";
};

/** Five commercial products under the NovaOS hub. */
export const ADMIN_PRODUCTS: AdminProductMeta[] = [
  {
    id: "novastore",
    label: "NovaStore",
    short: "賣場",
    href: "/admin/novastore",
    publicUrl: "https://novastore-omega.vercel.app",
    opsUrl: "https://novastore-omega.vercel.app/dashboard",
    opsLabel: "賣場營運後台",
    blurb: "對帳、訂單與賣場狀態",
    accent: "amber",
  },
  {
    id: "booking",
    label: "拓脈預約",
    short: "預約",
    href: "/admin/booking",
    publicUrl: "https://taiwanbiz.vercel.app",
    opsUrl: "https://taiwanbiz.vercel.app/admin/dashboard",
    opsLabel: "拓脈總管理",
    blurb: "預約、服務與店家營運",
    accent: "cyan",
  },
  {
    id: "novashield",
    label: "Nova商譽寶",
    short: "商譽寶",
    href: "/admin/novashield",
    publicUrl: "https://paycheck.com.de/novashield",
    opsUrl: "https://paycheck.com.de/novashield/admin",
    opsLabel: "商譽寶後台",
    blurb: "門市好評引導與客訴防護",
    accent: "sky",
  },
  {
    id: "subkeeper",
    label: "訂閱管家",
    short: "訂閱管家",
    href: "/admin/subkeeper",
    publicUrl: "https://temporary-speedy-reef-cy4xhhu.vercel.app",
    opsUrl: "https://temporary-speedy-reef-cy4xhhu.vercel.app/app",
    opsLabel: "訂閱管家 App",
    blurb: "個人訂閱追蹤與提醒",
    accent: "emerald",
  },
  {
    id: "dimension",
    label: "拓維空間",
    short: "拓維",
    href: "/admin/dimension",
    publicUrl: "https://novadimension.vercel.app",
    opsUrl: "https://novadimension.vercel.app/admin",
    opsLabel: "拓維管理",
    blurb: "Credit、生成與付費方案",
    accent: "rose",
  },
];

export const ADMIN_NAV_OVERVIEW: AdminNavItem = {
  id: "overview",
  href: "/admin/dashboard",
  label: "總覽",
  icon: "LayoutDashboard",
};

export const ADMIN_NAV_PRODUCTS: AdminNavItem[] = ADMIN_PRODUCTS.map((p) => ({
  id: p.id,
  href: p.href,
  label: p.label,
  icon:
    p.id === "novastore"
      ? "ShoppingCart"
      : p.id === "booking"
        ? "CalendarDays"
        : p.id === "novashield"
          ? "Shield"
          : p.id === "aidoc"
            ? "FileText"
            : p.id === "subkeeper"
              ? "CreditCard"
              : "Box",
}));

export const ADMIN_NAV_PLATFORM: AdminNavItem[] = [
  {
    id: "users",
    href: "/admin/users",
    label: "會員",
    icon: "Users",
  },
  {
    id: "settings",
    href: "/admin/settings",
    label: "系統",
    icon: "Settings",
  },
];

export function productFromPath(pathname: string): AdminProductMeta | null {
  return (
    ADMIN_PRODUCTS.find(
      (p) => pathname === p.href || pathname.startsWith(`${p.href}/`)
    ) || null
  );
}

export function siteFromPath(pathname: string): AdminSiteId {
  if (pathname.startsWith("/admin/novastore")) return "novastore";
  if (pathname.startsWith("/admin/booking")) return "booking";
  if (pathname.startsWith("/admin/novashield")) return "novashield";
  if (pathname.startsWith("/admin/aidoc")) return "aidoc";
  if (pathname.startsWith("/admin/subkeeper")) return "subkeeper";
  if (pathname.startsWith("/admin/dimension")) return "dimension";
  if (pathname.startsWith("/admin/users")) return "users";
  if (pathname.startsWith("/admin/settings")) return "settings";
  return "overview";
}
