"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SUBKEEPER_PRODUCT } from "@/lib/subkeeper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AccountState = {
  email: string;
  name: string;
  avatarUrl: string | null;
};

function initials(name: string, email: string) {
  const base = (name || email || "?").trim();
  return base.slice(0, 2).toUpperCase();
}

export function UserAccountMenu() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountState | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const meta = user.user_metadata || {};
      const name =
        (typeof meta.shop_name === "string" && meta.shop_name) ||
        (typeof meta.full_name === "string" && meta.full_name) ||
        (typeof meta.name === "string" && meta.name) ||
        user.email?.split("@")[0] ||
        "NovaOS 用戶";
      const avatarUrl =
        (typeof meta.avatar_url === "string" && meta.avatar_url) ||
        (typeof meta.picture === "string" && meta.picture) ||
        null;

      // Soft-load shop_name from profile when metadata empty
      let display = name;
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("shop_name")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.shop_name) display = profile.shop_name;
      } catch {
        /* ignore */
      }

      if (!cancelled) {
        setAccount({
          email: user.email || "",
          name: display,
          avatarUrl,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!account) return null;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/80 py-1 pl-1 pr-2.5 text-left transition hover:bg-secondary"
          aria-label="拓新雲端 NovaOS 帳號選單"
        >
          <Avatar className="h-8 w-8">
            {account.avatarUrl ? (
              <AvatarImage src={account.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-900">
              {initials(account.name, account.email)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[9rem] truncate text-xs sm:block">
            <span className="block font-medium text-foreground">
              {account.name}
            </span>
            <span className="block text-[10px] text-muted-foreground">
              拓新雲端 NovaOS 帳號
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-0.5 font-normal">
          <p className="text-sm font-medium">{account.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {account.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={SUBKEEPER_PRODUCT.hubUrl}>返回 NovaOS 主站</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard">產品矩陣／總控台</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={SUBKEEPER_PRODUCT.href}>訂閱管家</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">帳戶設定</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={signOut}
        >
          登出
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
