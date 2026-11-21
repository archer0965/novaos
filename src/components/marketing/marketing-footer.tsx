import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { LEGAL_DOC_LINKS } from "@/lib/legal";
import { PRODUCT_ECOSYSTEM } from "@/lib/product-ecosystem";
import { siteConfig } from "@/lib/site";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#04060c]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-1">
          <BrandLogo size="sm" variant="light" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
            拓新雲端 NovaOS——專業雲端工具與軟體解決方案開發商，打造可擴張的微型營運產品矩陣。
          </p>
        </div>

        <div className="text-sm">
          <p className="font-medium text-white">產品</p>
          <ul className="mt-3 space-y-2 text-slate-400">
            {PRODUCT_ECOSYSTEM.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.href}
                  className="hover:text-cyan-300"
                  {...(p.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-medium text-white">支援</p>
          <ul className="mt-3 space-y-2 text-slate-400">
            <li>
              <a className="hover:text-cyan-300" href={`mailto:${siteConfig.supportEmail}`}>
                {siteConfig.supportEmail}
              </a>
            </li>
            <li>
              <a
                className="hover:text-cyan-300"
                href={siteConfig.lineOfficialUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                LINE 官方帳號
              </a>
            </li>
            <li>
              <Link href="/contact" className="hover:text-cyan-300">
                聯絡我們
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-medium text-white">條款與法律</p>
          <ul className="mt-3 space-y-2 text-slate-400">
            <li>
              <Link href="/legal" className="font-medium text-slate-200 hover:text-cyan-300">
                條款與法律中心
              </Link>
            </li>
            {LEGAL_DOC_LINKS.map((doc) => (
              <li key={doc.id}>
                <Link href={doc.href} className="hover:text-cyan-300">
                  {doc.shortTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-5 text-center text-xs text-slate-600">
        © {year} {siteConfig.legalName}. All rights reserved.
        {siteConfig.companyRegisteredName
          ? ` · ${siteConfig.companyRegisteredName}`
          : ""}
        {siteConfig.companyTaxId ? ` · 統編 ${siteConfig.companyTaxId}` : ""}
      </div>
    </footer>
  );
}
