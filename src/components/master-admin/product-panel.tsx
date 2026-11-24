import { ExternalLink } from "lucide-react";
import type { AdminProductMeta } from "@/lib/master-admin/nav";
import { cn } from "@/lib/utils";

const ACCENT: Record<AdminProductMeta["accent"], string> = {
  amber: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  cyan: "border-cyan-400/30 bg-cyan-500/10 text-cyan-100",
  sky: "border-sky-400/30 bg-sky-500/10 text-sky-100",
  emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  rose: "border-rose-400/30 bg-rose-500/10 text-rose-100",
};

/**
 * Compact product context bar: this is hub analytics, with clear exits
 * to the public site and the product-native ops console.
 */
export function ProductPanelHeader({
  product,
  title,
  subtitle,
}: {
  product: AdminProductMeta;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium",
              ACCENT[product.accent]
            )}
          >
            {product.label}
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
            {title || product.label}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            {subtitle || product.blurb}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={product.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10"
          >
            公開網站
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
          <a
            href={product.opsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/30 bg-indigo-500/15 px-3 py-2 text-xs font-medium text-indigo-100 hover:bg-indigo-500/25"
          >
            {product.opsLabel}
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
        </div>
      </div>
      <p className="rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-[11px] leading-5 text-slate-500">
        此頁為 NovaOS 總管理的跨站監看。日常開店、排班、文件與 Credit
        操作請用右側「{product.opsLabel}」。
      </p>
    </div>
  );
}
