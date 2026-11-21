"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#products", label: "產品矩陣" },
  { href: "#partner", label: "特約／大使" },
  { href: "#pricing", label: "定價方案" },
  { href: "#why-us", label: "企業優勢" },
  { href: "#contact", label: "聯絡諮詢" },
] as const;

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <BrandLogo size="md" href="/" variant="light" />

        <nav className="hidden items-center gap-8 md:flex" aria-label="主要導覽">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5 hover:text-white"
          >
            登入
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            免費開始
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white md:hidden"
          aria-label={open ? "關閉選單" : "開啟選單"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-b border-white/10 bg-[#05070f]/95 px-4 pb-4 backdrop-blur md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-1" aria-label="手機導覽">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-3 text-sm font-medium text-slate-200"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="rounded-lg px-3 py-3 text-sm font-medium text-slate-200"
            onClick={() => setOpen(false)}
          >
            登入
          </Link>
          <Link
            href="/signup"
            className="mt-1 rounded-xl bg-cyan-400 px-3 py-3 text-center text-sm font-semibold text-slate-950"
            onClick={() => setOpen(false)}
          >
            免費開始
          </Link>
        </nav>
      </div>
    </header>
  );
}
