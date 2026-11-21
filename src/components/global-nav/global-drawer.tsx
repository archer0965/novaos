"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NOVA_MODULES, NOVA_MODULE_IDS, type NovaModuleId } from "@/lib/novaos";
import {
  HUB_MASTER_MENU,
  MODULE_FEATURE_MENUS,
  NOVAOS_HUB_HREF,
  isNavItemActive,
  moduleTitle,
  type NavMode,
} from "@/lib/nav-config";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export type GlobalDrawerProps = {
  open: boolean;
  onClose: () => void;
  mode: NavMode;
  unlockedModules?: NovaModuleId[];
  /** Landing: show login / signup */
  showAuthLinks?: boolean;
  /** Dashboard: show sign-out */
  onSignOut?: () => void;
  isAdmin?: boolean;
};

function DrawerLink({
  href,
  label,
  emoji,
  description,
  active,
  badge,
  onClick,
}: {
  href: string;
  label: string;
  emoji?: string;
  description?: string;
  active?: boolean;
  badge?: string | null;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-secondary text-foreground"
      )}
    >
      {emoji ? (
        <span className="mt-0.5 shrink-0 text-base leading-none" aria-hidden>
          {emoji}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
          {label}
          {badge ? (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
                active
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-amber-100 text-amber-900"
              )}
            >
              {badge}
            </span>
          ) : null}
        </span>
        {description ? (
          <span
            className={cn(
              "mt-0.5 block text-xs leading-snug",
              active ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            {description}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function GlobalDrawer({
  open,
  onClose,
  mode,
  unlockedModules = [],
  showAuthLinks = false,
  onSignOut,
  isAdmin = false,
}: GlobalDrawerProps) {
  const pathname = usePathname();
  const unlocked = new Set(unlockedModules);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const isHub = mode === "hub";

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="關閉選單"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in-0"
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex w-[min(22rem,100vw)] flex-col border-l border-border bg-card text-card-foreground shadow-2xl",
          "animate-in slide-in-from-right duration-200"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">
              {isHub ? "Hub Master Menu" : "Sub-module Menu"}
            </p>
            <p className="truncate font-display text-base font-semibold">
              {moduleTitle(mode)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-secondary"
            aria-label="關閉"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          {!isHub ? (
            <div className="mb-4 sticky top-0 z-10 -mx-1 rounded-xl bg-card/95 px-1 pb-2 backdrop-blur">
              <DrawerLink
                href={NOVAOS_HUB_HREF}
                label="返回 NovaOS 總控台"
                emoji="🏠"
                active={pathname === NOVAOS_HUB_HREF}
                onClick={onClose}
              />
            </div>
          ) : null}

          {isHub ? (
            HUB_MASTER_MENU.map((section) => (
              <section key={section.title} className="mb-4">
                <p className="px-2 pb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground">
                  {section.title}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const isModule = NOVA_MODULE_IDS.some(
                      (id) => NOVA_MODULES[id].href === item.href
                    );
                    const modId = NOVA_MODULE_IDS.find(
                      (id) => NOVA_MODULES[id].href === item.href
                    );
                    const locked = Boolean(modId && !unlocked.has(modId));
                    return (
                      <li key={item.href + item.label}>
                        <DrawerLink
                          href={item.href}
                          label={item.label}
                          emoji={item.emoji}
                          description={item.description}
                          active={isNavItemActive(pathname, item)}
                          badge={
                            isModule && locked ? "免費試用" : null
                          }
                          onClick={onClose}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          ) : (
            <section className="mb-4">
              <p className="px-2 pb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground">
                {NOVA_MODULES[mode].name} 功能
              </p>
              <ul className="space-y-0.5">
                {MODULE_FEATURE_MENUS[mode].map((item) => (
                  <li key={item.href + item.label}>
                    <DrawerLink
                      href={item.href}
                      label={item.label}
                      emoji={item.emoji}
                      description={item.description}
                      active={isNavItemActive(pathname, item)}
                      onClick={onClose}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!isHub ? (
            <section className="mb-4 border-t border-border pt-4">
              <p className="px-2 pb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground">
                跨模組一鍵切換
              </p>
              <ul className="space-y-0.5">
                {NOVA_MODULE_IDS.map((id) => {
                  const mod = NOVA_MODULES[id];
                  const active = mode === id;
                  const locked = !unlocked.has(id);
                  return (
                    <li key={id}>
                      <DrawerLink
                        href={mod.href}
                        label={mod.name}
                        emoji={mod.emoji}
                        description={mod.blurb}
                        active={active}
                        badge={locked ? "免費試用" : null}
                        onClick={onClose}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <section className="mb-2 border-t border-border pt-4">
            <p className="px-2 pb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground">
              客服諮詢
            </p>
            <ul className="space-y-0.5">
              <li>
                <DrawerLink
                  href="/contact"
                  label="聯絡表單"
                  emoji="✉️"
                  active={pathname.startsWith("/contact")}
                  onClick={onClose}
                />
              </li>
              <li>
                <a
                  href={siteConfig.lineOfficialUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={onClose}
                  className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  <span aria-hidden>💬</span>
                  <span>
                    官方 LINE
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      開啟客服對話
                    </span>
                  </span>
                </a>
              </li>
            </ul>
          </section>

          {isAdmin ? (
            <section className="mb-2">
              <DrawerLink
                href="/dashboard/admin"
                label="管理後台"
                emoji="🛡️"
                active={pathname.startsWith("/dashboard/admin")}
                onClick={onClose}
              />
            </section>
          ) : null}

          {showAuthLinks ? (
            <section className="mt-2 border-t border-border pt-3 sm:hidden">
              <DrawerLink
                href="/login"
                label="登入"
                emoji="🔑"
                onClick={onClose}
              />
              <DrawerLink
                href="/signup"
                label="免費註冊"
                emoji="✨"
                onClick={onClose}
              />
            </section>
          ) : null}

          {onSignOut ? (
            <section className="mt-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <span aria-hidden>🚪</span>
                登出
              </button>
            </section>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
