import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { PRODUCT_ECOSYSTEM, type ProductCard } from "@/lib/product-ecosystem";
import { cn } from "@/lib/utils";

const accentRing: Record<ProductCard["accent"], string> = {
  cyan: "from-cyan-400/25 via-transparent to-transparent hover:border-cyan-400/40",
  amber: "from-amber-400/25 via-transparent to-transparent hover:border-amber-400/40",
  emerald:
    "from-emerald-400/25 via-transparent to-transparent hover:border-emerald-400/40",
  sky: "from-sky-400/25 via-transparent to-transparent hover:border-sky-400/40",
};

const accentText: Record<ProductCard["accent"], string> = {
  cyan: "text-cyan-300",
  amber: "text-amber-300",
  emerald: "text-emerald-300",
  sky: "text-sky-300",
};

const accentBtn: Record<ProductCard["accent"], string> = {
  cyan: "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
  amber: "bg-amber-400 text-slate-950 hover:bg-amber-300",
  emerald: "bg-emerald-400 text-slate-950 hover:bg-emerald-300",
  sky: "bg-sky-400 text-slate-950 hover:bg-sky-300",
};

export function ProductMatrix() {
  return (
    <section id="products" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-cyan-300/90">
            PRODUCT ECOSYSTEM
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            產品與服務矩陣
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
            每個分支產品都能獨立創造價值，也能在拓新雲端帳號體系下協同運作。
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {PRODUCT_ECOSYSTEM.map((product) => (
            <ProductCardItem key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCardItem({ product }: { product: ProductCard }) {
  const linkProps = product.external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition duration-300 sm:p-8",
        "hover:-translate-y-1 hover:bg-white/[0.05]",
        accentRing[product.accent]
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          accentRing[product.accent]
        )}
        aria-hidden
      />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("text-xs font-semibold tracking-[0.16em]", accentText[product.accent])}>
            {product.nameEn.toUpperCase()}
          </p>
          {product.badge ? (
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-300">
              {product.badge}
            </span>
          ) : null}
        </div>

        <h3 className="font-display mt-3 text-2xl font-semibold text-white">
          {product.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
          {product.tagline}
        </p>

        <p className="mt-5 text-xs font-medium uppercase tracking-wider text-slate-500">
          適用客群
        </p>
        <p className="mt-1 text-sm text-slate-300">{product.audience}</p>

        <p className="mt-5 text-xs font-medium uppercase tracking-wider text-slate-500">
          產品亮點
        </p>
        <ul className="mt-2 space-y-2">
          {product.highlights.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
              <Check className={cn("mt-0.5 h-4 w-4 shrink-0", accentText[product.accent])} />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs font-medium uppercase tracking-wider text-slate-500">
          核心優勢
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-300">{product.advantage}</p>

        <Link
          href={product.href}
          {...linkProps}
          className={cn(
            "mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition",
            accentBtn[product.accent]
          )}
        >
          {product.ctaLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
