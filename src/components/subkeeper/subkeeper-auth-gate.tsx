import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SUBKEEPER_PRODUCT } from "@/lib/subkeeper";
import { PRODUCT_ECOSYSTEM } from "@/lib/product-ecosystem";

/** Anonymous landing for 訂閱管家 — must use NovaOS unified login. */
export function SubkeeperAuthGate() {
  return (
    <div className="flex min-h-[100svh] flex-col bg-gradient-to-b from-emerald-50 via-background to-sky-50/40">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-5">
        <BrandLogo href="/" size="md" />
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="hidden text-muted-foreground hover:text-foreground sm:inline"
          >
            返回拓新雲端
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href={SUBKEEPER_PRODUCT.loginHref}>登入</Link>
          </Button>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 pb-16">
        <p className="text-sm font-semibold tracking-wide text-emerald-800">
          📒 {SUBKEEPER_PRODUCT.name}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          使用拓新雲端 NovaOS 帳號登入
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          訂閱管家已升級為雲端帳號制：訂閱清單綁定你的 NovaOS
          身分，與 NovaStore
          等產品共用同一組登入。未登入訪客無法讀寫他人或匿名資料。
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button asChild className="h-12 text-base">
            <Link href={SUBKEEPER_PRODUCT.loginHref}>
              使用 拓新雲端 NovaOS 帳號登入
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11">
            <Link href={SUBKEEPER_PRODUCT.signupHref}>還沒有帳號？免費註冊</Link>
          </Button>
        </div>

        <section className="mt-10 rounded-2xl border border-border/70 bg-card/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            產品矩陣
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {PRODUCT_ECOSYSTEM.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.href}
                  className="block rounded-xl px-3 py-2 text-sm hover:bg-secondary"
                  {...(p.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {p.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/"
                className="block rounded-xl px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-secondary"
              >
                拓新雲端 NovaOS 主站
              </Link>
            </li>
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
