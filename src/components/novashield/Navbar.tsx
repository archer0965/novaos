"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LayoutDashboard, Shield, Sparkles, Store } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/novashield", label: "產品介紹", icon: Sparkles },
    { href: "/novashield/admin", label: "店家管理後台", icon: LayoutDashboard },
    { href: "/novashield/feedback/shop123", label: "顧客評分體驗", icon: Store },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/novashield" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F172A] text-[#F59E0B] shadow-sm">
            <Shield className="h-5 w-5 fill-[#F59E0B]/20" />
          </div>
          <div className="leading-tight">
            <span className="hidden text-[10px] font-bold tracking-wide text-slate-500 sm:block">
              NovaOS 拓新雲端
            </span>
            <span className="block text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">
              Nova商譽寶{" "}
              <span className="hidden font-semibold text-amber-600 sm:inline">
                (NovaShield)
              </span>
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/novashield"
                ? pathname === "/novashield"
                : pathname.startsWith(item.href.split("/").slice(0, 3).join("/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  isActive
                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/"
            className="hidden items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-amber-300 hover:text-amber-700 md:inline-flex"
          >
            <span>拓新雲端主頁</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
