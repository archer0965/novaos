"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  clearLegacyLocalSubscriptions,
  readLegacyLocalSubscriptions,
  type LegacySubkeeperItem,
} from "@/lib/subkeeper";

/**
 * First-login bridge: detect old SubKeeper localStorage and offer one-click sync.
 */
export function SubkeeperLegacyMigrate({
  onImported,
}: {
  onImported?: () => void;
}) {
  const [items, setItems] = useState<LegacySubkeeperItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setItems(readLegacyLocalSubscriptions());
  }, []);

  if (dismissed || !items || items.length === 0) return null;

  async function syncNow() {
    const payload = items;
    if (!payload?.length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/subkeeper/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "同步失敗");
      clearLegacyLocalSubscriptions();
      toast.success(
        `已同步 ${json.imported ?? payload.length} 筆本機訂閱至拓新雲端帳號`
      );
      setDismissed(true);
      onImported?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "同步失敗");
    } finally {
      setBusy(false);
    }
  }

  function skip() {
    setDismissed(true);
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 md:p-5">
      <p className="font-display text-base font-semibold text-amber-950">
        檢測到本機舊資料
      </p>
      <p className="mt-1 text-sm text-amber-950/80">
        找到 {items.length}{" "}
        筆舊版訂閱管家（免登入）紀錄。是否一鍵同步至拓新雲端 NovaOS
        帳號？同步成功後將清除本機快取。
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={busy}
          onClick={syncNow}
          className="h-10 gap-1.5 bg-amber-700 text-white hover:bg-amber-800"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          一鍵同步至 NovaOS 帳號
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={skip}
          className="h-10"
        >
          稍後再說
        </Button>
      </div>
    </div>
  );
}
