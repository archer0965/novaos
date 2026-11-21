"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isFreeModule, NOVA_MODULES, type NovaModuleId } from "@/lib/novaos";
import { SUBKEEPER_PRODUCT } from "@/lib/subkeeper";
import { cn } from "@/lib/utils";

const ORDER: NovaModuleId[] = ["booking", "store", "ai_doc", "pass"];

export function ModuleTabs({
  unlocked,
}: {
  unlocked: NovaModuleId[];
}) {
  const pathname = usePathname();
  const unlockedSet = new Set(unlocked);
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="inline-flex min-w-full gap-1 rounded-2xl border border-border/80 bg-secondary/40 p-1 sm:min-w-0">
        {ORDER.map((id) => {
          const mod = NOVA_MODULES[id];
          const active =
            pathname === mod.href || pathname.startsWith(`${mod.href}/`);
          const free = isFreeModule(id);
          const locked = !free && !unlockedSet.has(id);
          return (
            <Link
              key={id}
              href={mod.href}
              prefetch
              className={cn(
                "inline-flex min-w-[7.5rem] flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : locked
                    ? "text-muted-foreground/70 hover:bg-background/60"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
              )}
              title={
                free
                  ? "訂閱中控永久免費"
                  : locked
                    ? "尚未啟用 — 點擊前往啟用試用"
                    : mod.blurb
              }
            >
              <span aria-hidden>{mod.emoji}</span>
              <span className="font-medium">{mod.name}</span>
              {free ? (
                <span className="text-[10px] opacity-80">免費</span>
              ) : locked ? (
                <span className="text-[10px] opacity-70">啟用</span>
              ) : null}
            </Link>
          );
        })}
        <a
          href={SUBKEEPER_PRODUCT.siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-w-[7.5rem] flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          title="開啟訂閱管家（獨立站）"
        >
          <span aria-hidden>📒</span>
          <span className="font-medium">{SUBKEEPER_PRODUCT.name}</span>
          <span className="text-[10px] opacity-80">免費</span>
        </a>
      </div>
    </div>
  );
}
