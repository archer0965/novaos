import Image from "next/image";
import Link from "next/link";
import { Camera, ExternalLink } from "lucide-react";
import { IG_PROFILE_URL, PARENT_SITE_URL } from "@/lib/constants";
import { NOVAOS_LEGAL_URL } from "@/lib/novaos-hub";
import { PARENT_BRAND, SITE_NAME } from "@/lib/site";

const footerLinks = [
  { href: "/#studio", label: "AI 生成" },
  { href: "/#pricing", label: "方案收費" },
  { href: "/#cases", label: "改造案例" },
  { href: "/#faq", label: "常見問題" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line pb-12 pt-10">
      <div className="section-shell grid gap-8 md:grid-cols-[1.35fr_1fr] md:items-start">
        <div className="flex items-start gap-3">
          <Image
            src="/logo-icon.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-contain"
          />
          <div>
            <p className="font-display text-sm font-semibold tracking-tight">
              {SITE_NAME}
            </p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-ink-muted">
              本服務由{PARENT_BRAND}
              提供技術支援。AI 視覺生成僅供軟裝靈感參考，不含實體代購與硬裝工程。
            </p>
            <p className="mt-3 text-xs text-ink-muted">
              © 2026 拓維空間NovaDimension · 附屬於{PARENT_BRAND}. All rights
              reserved.
              {" · "}
              <a
                href={NOVAOS_LEGAL_URL}
                className="underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                法律條款
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 md:items-end">
          <nav
            className="flex flex-wrap gap-x-4 gap-y-2 md:justify-end"
            aria-label="頁尾導覽"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={PARENT_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              返回{PARENT_BRAND}
              <ExternalLink size={12} aria-hidden />
            </a>
          </nav>
          <a
            href={IG_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-ivory text-ink transition-colors hover:border-accent/40 hover:text-accent"
            aria-label="前往 Instagram"
          >
            <Camera size={18} aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
