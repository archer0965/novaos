"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  CreditCard,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  ADMIN_NAV,
  ADMIN_SITES,
  PRODUCT_WORKSPACES,
  siteFromPath,
} from "@/lib/master-admin/nav";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ICONS = {
  LayoutDashboard,
  ShoppingCart,
  CalendarDays,
  FileText,
  CreditCard,
  Users,
  Settings,
} as const;

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
  const [siteOpen, setSiteOpen] = useState(false);

  const activeSite = useMemo(() => siteFromPath(pathname), [pathname]);
  const currentSite =
    ADMIN_SITES.find((s) => s.id === activeSite) || ADMIN_SITES[0];

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="管理導覽">
      {ADMIN_NAV.map((item) => {
        const Icon = ICONS[item.icon as keyof typeof ICONS] || LayoutDashboard;
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-400/30"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                active ? "text-indigo-300" : "text-slate-400"
              )}
            />
            <span className="min-w-0">
              <span className="block font-medium leading-5">{item.label}</span>
              {item.description ? (
                <span className="mt-0.5 block text-[11px] leading-4 text-slate-500 group-hover:text-slate-400">
                  {item.description}
                </span>
              ) : null}
            </span>
          </Link>
        );
      })}
      <div className="mt-3 border-t border-white/10 pt-3">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          功能工作台（前台產品）
        </p>
        {PRODUCT_WORKSPACES.map((ws) => (
          <a
            key={ws.id}
            href={ws.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-teal-200/90 hover:bg-teal-500/10 hover:text-teal-100"
          >
            <span>{ws.label}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
        ))}
      </div>
    </nav>
  );

  return (
    <div className="master-admin min-h-screen bg-[#0b1020] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-[#0e152b] lg:flex">
          <div className="border-b border-white/10 px-4 py-4">
            <BrandLogo size="sm" href="/admin/dashboard" />
            <p className="mt-2 text-[11px] font-medium tracking-wide text-indigo-300/90">
              Master Admin Console
            </p>
          </div>
          {nav}
          <div className="border-t border-white/10 p-3 text-xs text-slate-500">
            {email}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1020]/90 backdrop-blur-xl">
            <div className="flex h-14 items-center gap-3 px-4 md:px-6">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 lg:hidden"
                aria-label={mobileOpen ? "關閉選單" : "開啟選單"}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>

              <div className="relative">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 hover:bg-white/10"
                  onClick={() => setSiteOpen((v) => !v)}
                  aria-expanded={siteOpen}
                >
                  <span className="text-slate-400">專案</span>
                  <span className="font-medium">{currentSite.short}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                {siteOpen ? (
                  <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#121a33] shadow-2xl">
                    {ADMIN_SITES.map((site) => (
                      <button
                        key={site.id}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-white/5",
                          site.id === currentSite.id
                            ? "bg-indigo-500/15 text-indigo-100"
                            : "text-slate-200"
                        )}
                        onClick={() => {
                          setSiteOpen(false);
                          router.push(site.href);
                        }}
                      >
                        <span>{site.label}</span>
                        {site.externalUrl ? (
                          <a
                            href={site.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                {currentSite.externalUrl ? (
                  <a
                    href={
                      PRODUCT_WORKSPACES.find((p) => p.id === currentSite.id)
                        ?.href || currentSite.externalUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-teal-400/30 bg-teal-500/10 px-3 py-1.5 text-sm font-medium text-teal-100 hover:bg-teal-500/20"
                  >
                    前往功能工作台
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
                <Link
                  href="/dashboard"
                  className="hidden rounded-xl border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white sm:inline"
                >
                  NovaOS 產品總控台
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void signOut()}
                  className="text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
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
