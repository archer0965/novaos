"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Sparkles, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { PARENT_SITE_URL } from "@/lib/constants";
import { SITE_NAME } from "@/lib/site";

const links = [
  { href: "#studio", label: "AI 生成" },
  { href: "#pricing", label: "方案收費" },
  { href: "#cases", label: "改造案例" },
  { href: "#faq", label: "常見問題" },
];

function resolveHref(pathname: string, hash: string) {
  return pathname === "/" ? hash : `/${hash}`;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const clickTimes = useRef<number[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleLogoClick(event: MouseEvent<HTMLAnchorElement>) {
    const now = Date.now();
    const recent = clickTimes.current.filter((time) => now - time < 2500);
    recent.push(now);
    clickTimes.current = recent;

    if (recent.length < 10) return;

    event.preventDefault();
    clickTimes.current = [];

    try {
      await fetch("/api/admin/unlock", { method: "POST" });
      router.push("/admin");
    } catch {
      router.push("/admin");
    }
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled || open
          ? "bg-[rgba(253,251,247,0.92)] shadow-[0_10px_30px_rgba(44,42,40,0.05)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="section-shell flex h-[4.25rem] items-center justify-between gap-3 md:h-[4.75rem]">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5"
          aria-label={`${SITE_NAME} 首頁`}
          onClick={handleLogoClick}
        >
          <Image
            src="/logo-icon.png"
            alt=""
            width={44}
            height={44}
            className="h-10 w-10 shrink-0 object-contain md:h-11 md:w-11"
            priority
          />
          <span className="min-w-0 leading-tight">
            <span className="font-display block truncate text-[0.88rem] font-semibold tracking-tight text-ink md:text-[0.98rem]">
              拓維空間
            </span>
            <span className="block text-[0.68rem] tracking-[0.06em] text-ink-muted">
              NovaDimension
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-4 lg:flex" aria-label="主要導覽">
          {links.map((link) => (
            <Link
              key={link.href}
              href={resolveHref(pathname, link.href)}
              className="text-[0.8125rem] font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={resolveHref(pathname, "#studio")}
            className="btn btn-primary px-4 text-sm"
          >
            <Sparkles size={15} aria-hidden />
            免費試用 1 次
          </Link>
          <a
            href={PARENT_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary px-4 text-sm"
          >
            返回拓新雲端
            <ExternalLink size={14} aria-hidden />
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-ivory/80 text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "關閉選單" : "開啟選單"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`border-t border-line bg-[rgba(253,251,247,0.97)] backdrop-blur-xl lg:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <nav className="section-shell flex flex-col gap-2 py-4" aria-label="行動導覽">
          {links.map((link) => (
            <Link
              key={link.href}
              href={resolveHref(pathname, link.href)}
              className="rounded-2xl px-4 py-3 text-base font-medium text-ink transition-colors hover:bg-cream"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={resolveHref(pathname, "#studio")}
            className="btn btn-primary mt-2 w-full"
            onClick={() => setOpen(false)}
          >
            <Sparkles size={15} aria-hidden />
            免費試用 1 次
          </Link>
          <a
            href={PARENT_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary w-full"
            onClick={() => setOpen(false)}
          >
            返回拓新雲端
            <ExternalLink size={14} aria-hidden />
          </a>
        </nav>
      </div>
    </header>
  );
}
