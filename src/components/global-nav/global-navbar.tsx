"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { GlobalDrawer } from "@/components/global-nav/global-drawer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { NOVA_MODULES, type NovaModuleId } from "@/lib/novaos";
import { moduleTitle, resolveNavMode, type NavMode } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export type GlobalNavbarProps = {
  /** Marketing hero (dark) vs dashboard (light surface) */
  variant?: "marketing" | "app";
  unlockedModules?: NovaModuleId[];
  isAdmin?: boolean;
  showAuthLinks?: boolean;
  /** Force menu mode; default from pathname */
  mode?: NavMode;
  className?: string;
};

const QUICK_DESKTOP: { id: NovaModuleId | "hub"; href: string; label: string }[] =
  [
    { id: "hub", href: "/dashboard", label: "總控台" },
    {
      id: "booking",
      href: NOVA_MODULES.booking.href,
      label: NOVA_MODULES.booking.name,
    },
    {
      id: "store",
      href: NOVA_MODULES.store.href,
      label: NOVA_MODULES.store.name,
    },
    {
      id: "ai_doc",
      href: NOVA_MODULES.ai_doc.href,
      label: NOVA_MODULES.ai_doc.name,
    },
    {
      id: "pass",
      href: NOVA_MODULES.pass.href,
      label: NOVA_MODULES.pass.name,
    },
  ];

export function GlobalNavbar({
  variant = "app",
  unlockedModules = [],
  isAdmin = false,
  showAuthLinks = false,
  mode: modeProp,
  className,
}: GlobalNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const mode = modeProp ?? resolveNavMode(pathname);
  const unlocked = useMemo(() => new Set(unlockedModules), [unlockedModules]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const isMarketing = variant === "marketing";

  return (
    <>
      <header
        className={cn(
          isMarketing
            ? "relative z-50 mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:absolute md:inset-x-0 md:top-0 md:mx-auto md:w-full md:max-w-6xl md:py-5"
            : "nav-surface sticky top-0 z-40 border-b",
          className
        )}
      >
        <div
          className={cn(
            "flex w-full items-center justify-between gap-3",
            !isMarketing && "mx-auto h-14 max-w-6xl px-4"
          )}
        >
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <BrandLogo
              size={isMarketing ? "md" : "sm"}
              href={isMarketing ? "/" : "/dashboard"}
              className={cn(isMarketing && "text-sky-50")}
            />
            {!isMarketing && mode !== "hub" ? (
              <span className="hidden truncate text-sm text-muted-foreground md:inline">
                {moduleTitle(mode)}
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {!isMarketing ? (
              <nav className="hidden items-center gap-0.5 lg:flex" aria-label="模組捷徑">
                {QUICK_DESKTOP.map((item) => {
                  const active =
                    item.id === "hub"
                      ? pathname === "/dashboard"
                      : mode === item.id;
                  const locked =
                    item.id !== "hub" && !unlocked.has(item.id as NovaModuleId);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      prefetch
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                      title={locked ? "尚未啟用 — 免費試用" : undefined}
                    >
                      {item.label}
                      {locked ? (
                        <span className="text-[9px] opacity-80">試用</span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            ) : null}

            {showAuthLinks ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="hidden text-sky-50 hover:bg-white/10 hover:text-white sm:inline-flex"
                >
                  <Link href="/login" prefetch>
                    登入
                  </Link>
                </Button>
                <Button
                  asChild
                  className="hidden bg-accent text-accent-foreground hover:bg-accent/90 sm:inline-flex"
                >
                  <Link href="/signup" prefetch>
                    免費開始
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 sm:hidden"
                >
                  <Link href="/login" prefetch>
                    登入
                  </Link>
                </Button>
              </>
            ) : null}

            <button
              type="button"
              aria-label="開啟選單"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                isMarketing
                  ? "text-sky-50 hover:bg-white/10"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <GlobalDrawer
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        unlockedModules={unlockedModules}
        showAuthLinks={showAuthLinks}
        onSignOut={showAuthLinks ? undefined : signOut}
        isAdmin={isAdmin}
      />
    </>
  );
}
