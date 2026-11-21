"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NOVA_MODULES, type NovaModuleId } from "@/lib/novaos";

export function ModuleActivateGate({
  moduleId,
  earlyBirdOpen,
  earlyBirdRemaining,
  earlyBirdMax,
  vipHint,
}: {
  moduleId: NovaModuleId;
  earlyBirdOpen: boolean;
  earlyBirdRemaining: number;
  earlyBirdMax: number;
  vipHint?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const mod = NOVA_MODULES[moduleId];

  async function activate() {
    setLoading(true);
    try {
      const res = await fetch("/api/modules/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "啟用失敗");
      toast.success(json.message || "已啟用");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "啟用失敗");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border/80 bg-gradient-to-br from-sky-50 via-background to-amber-50/40 p-6 text-center">
      <p className="text-sm text-muted-foreground">
        {mod.emoji} {mod.name}
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold">啟用子模組以開始試用</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        註冊 NovaOS 帳號不會扣除早鳥名額，也不會開始倒數試用。請點擊啟用後才寫入
        activated_at，並依資格開始試用天數。
      </p>
      <ul className="mt-4 space-y-2 text-left text-sm">
        <li className="rounded-xl bg-background/80 px-3 py-2">
          {earlyBirdOpen ? (
            <>
              <Sparkles className="mr-1 inline h-4 w-4 text-amber-600" />
              早鳥尚餘 {earlyBirdRemaining}/{earlyBirdMax} 名 → 啟用後{" "}
              <strong>14 天免費試用</strong>＋早鳥價
            </>
          ) : (
            <>
              早鳥名額已滿 → 啟用後 <strong>7 天免費試用</strong>＋一般價
            </>
          )}
        </li>
        {vipHint ? (
          <li className="rounded-xl bg-amber-50 px-3 py-2 text-amber-950">
            {vipHint}
          </li>
        ) : null}
      </ul>
      <Button
        type="button"
        className="mt-6 h-12 w-full text-base"
        disabled={loading}
        onClick={activate}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        啟用 {mod.name}
      </Button>
    </div>
  );
}
