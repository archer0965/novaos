"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Menu, Shield, Sparkles, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#features", label: "產品特色" },
  { href: "#pricing", label: "方案定價" },
  { href: "#faq", label: "常見問題 FAQ" },
  { href: "#compliance", label: "合規聲明" },
];

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo: NovaOS 拓新雲端 + Nova商譽寶 (NovaShield) */}
        <Link href="/novashield" className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F172A] text-[#F59E0B] shadow-sm">
            <Shield className="h-5 w-5 fill-[#F59E0B]/20" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#F59E0B] text-[8px] font-black text-white shadow-sm">
              ★
            </span>
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold tracking-wide text-slate-500">
                NovaOS 拓新雲端
              </span>
              <span className="hidden rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200/70 sm:inline-block">
                微服務
              </span>
            </div>
            <span className="block text-sm font-extrabold tracking-tight text-[#0F172A] sm:text-base">
              Nova商譽寶{" "}
              <span className="font-semibold text-amber-600">(NovaShield)</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          aria-label="主導覽列"
          className="hidden items-center gap-7 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-600 transition hover:text-[#0F172A]"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 transition hover:text-amber-800"
          >
            <span>拓新雲端主頁</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <Link
            href="/novashield/admin"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#0F172A]"
          >
            登入後台
          </Link>
          <Link
            href="/novashield/admin?shop=shop-free"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
          >
            <Sparkles className="h-4 w-4 text-[#F59E0B]" />
            <span>免費開始使用</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? "關閉選單" : "開啟選單"}
          aria-expanded={mobileMenuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-4">
            <Link
              href="/novashield/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-bold text-slate-800"
            >
              登入後台
            </Link>
            <Link
              href="/novashield/admin?shop=shop-free"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl bg-[#0F172A] px-4 py-2.5 text-center text-sm font-bold text-white"
            >
              免費開始使用
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
