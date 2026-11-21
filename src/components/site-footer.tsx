import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { LEGAL_DOC_LINKS } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandLogo size="sm" />
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {siteConfig.tagline}。客服信箱與 LINE 官方帳號如下。
          </p>
        </div>

        <div className="text-sm">
          <p className="font-medium text-foreground">客服聯絡</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              Email：{" "}
              <a
                className="text-primary underline-offset-2 hover:underline"
                href={`mailto:${siteConfig.supportEmail}`}
              >
                {siteConfig.supportEmail}
              </a>
            </li>
            <li>
              LINE 官方帳號：{" "}
              <a
                className="text-primary underline-offset-2 hover:underline"
                href={siteConfig.lineOfficialUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                點此加入
              </a>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary">
                聯絡我們
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-medium text-foreground">條款與法律</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <Link href="/legal" className="font-medium text-foreground hover:text-primary">
                條款與法律中心
              </Link>
            </li>
            {LEGAL_DOC_LINKS.map((doc) => (
              <li key={doc.id}>
                <Link href={doc.href} className="hover:text-primary">
                  {doc.shortTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-medium text-foreground">快速連結</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <Link href="/track" className="hover:text-primary">
                買家查單
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className="hover:text-primary">
                價格方案
              </Link>
            </li>
            <li>
              <Link href="/#partner" className="hover:text-primary">
                特約／大使申請
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-primary">
                免費註冊
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
        © {year} {siteConfig.legalName}
        {siteConfig.companyRegisteredName
          ? ` · ${siteConfig.companyRegisteredName}`
          : ""}
        {siteConfig.companyTaxId ? ` · 統編 ${siteConfig.companyTaxId}` : ""}
      </div>
    </footer>
  );
}
