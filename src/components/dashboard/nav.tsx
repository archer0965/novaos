"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Shield,
  Ticket,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/dashboard", label: "總覽", icon: LayoutDashboard },
    { href: "/dashboard/orders", label: "訂單", icon: Package },
    { href: "/dashboard/coupons", label: "優惠", icon: Ticket },
    { href: "/dashboard/pass", label: "訂閱中控", icon: Settings },
    ...(isAdmin
      ? [{ href: "/admin/dashboard", label: "總管理", icon: Shield }]
      : []),
  ];

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="nav-surface sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <BrandLogo size="sm" href="/dashboard" />
        <nav className="hidden items-center gap-1 sm:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                prefetch
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            登出
          </Button>
        </nav>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="text-muted-foreground sm:hidden"
          aria-label="登出"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
