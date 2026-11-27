"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  CalendarDays,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  ADMIN_NAV_OVERVIEW,
  ADMIN_NAV_PLATFORM,
  ADMIN_NAV_PRODUCTS,
  type AdminNavItem,
} from "@/lib/master-admin/nav";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ICONS = {
  LayoutDashboard,
  ShoppingCart,
  CalendarDays,
  Shield,
  FileText,
  CreditCard,
  Box,
  Users,
  Settings,
} as const;

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: AdminNavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const Icon = ICONS[item.icon as keyof typeof ICONS] || LayoutDashboard;
  const active =
    item.href === "/admin/dashboard"
      ? pathname === "/admin/dashboard" || pathname === "/admin"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-white/10 font-medium text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-indigo-300" : "")} />
      {item.label}
    </Link>
  );
}

function NavGroup({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: AdminNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>
      {items.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

export function MasterAdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-2 px-2 pb-3" aria-label="總管理導覽">
      <div className="pt-2">
        <NavLink
          item={ADMIN_NAV_OVERVIEW}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>
      <NavGroup
        title="產品"
        items={ADMIN_NAV_PRODUCTS}
        pathname={pathname}
        onNavigate={() => setMobileOpen(false)}
      />
      <NavGroup
        title="平台"
        items={ADMIN_NAV_PLATFORM}
        pathname={pathname}
        onNavigate={() => setMobileOpen(false)}
      />
    </nav>
  );

  return (
    <div className="master-admin min-h-screen bg-[#0b1020] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 bg-[#0e152b] lg:flex">
          <div className="border-b border-white/10 px-4 py-4">
            <BrandLogo size="sm" href="/admin/dashboard" />
            <p className="mt-2 text-[11px] font-medium tracking-wide text-slate-400">
              總管理後台
            </p>
          </div>
          {nav}
          <div className="mt-auto border-t border-white/10 px-4 py-3">
            <p className="truncate text-[11px] text-slate-500" title={email}>
              {email}
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1020]/90 backdrop-blur-xl">
            <div className="flex h-14 items-center gap-3 px-4 md:px-6">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 lg:hidden"
                aria-label={mobileOpen ? "關閉選單" : "開啟選單"}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">NovaOS 總管理</p>
                <p className="truncate text-[11px] text-slate-500 lg:hidden">
                  {email}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Link
                  href="/dashboard/pass"
                  className="hidden rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200 sm:inline"
                >
                  會員中心
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void signOut()}
                  className="h-8 text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  登出
                </Button>
              </div>
            </div>
          </header>

          {mobileOpen ? (
            <div className="border-b border-white/10 bg-[#0e152b] lg:hidden">
              {nav}
            </div>
          ) : null}

          <main className="flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
