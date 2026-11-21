"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handoffAssignUrl } from "@/lib/auth-handoff";
import {
  isAbsoluteTrustedReturn,
  resolveAuthNext,
} from "@/lib/trusted-returns";
import { createClient } from "@/lib/supabase/client";

/**
 * Already signed-in on hub: carry session to product /auth/receive.
 * Used when middleware cannot attach hash tokens on a 302.
 */
export function AuthHandoffClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("正在返回原網站…");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = resolveAuthNext(searchParams.get("next"));
      if (!isAbsoluteTrustedReturn(next)) {
        router.replace(next.startsWith("/") ? next : "/dashboard");
        return;
      }
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      const assign = handoffAssignUrl(next, session);
      if (assign) {
        window.location.replace(assign);
        return;
      }
      setMessage("無法帶入登入狀態，改直接返回…");
      window.location.replace(next);
    })().catch(() => {
      setMessage("導回失敗，請重新登入");
    });
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">{message}</p>
    </main>
  );
}
