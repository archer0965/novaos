"use client";

import Link from "next/link";
import { ArrowLeft, Settings2 } from "lucide-react";
import { CustomerFeedbackFlow } from "./CustomerFeedbackFlow";
import { usePersistedShop } from "@/lib/novashield/shopStore";
import type { ShopConfig } from "@/lib/novashield/types";

interface FeedbackPageClientProps {
  initialShop: ShopConfig;
}

export function FeedbackPageClient({ initialShop }: FeedbackPageClientProps) {
  const { shop } = usePersistedShop(initialShop.shopId, initialShop);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-[#FAF8F5] to-slate-100/70 px-4 py-6 sm:py-10">
      <div className="mx-auto mb-5 flex max-w-md items-center justify-between">
        <Link
          href="/novashield"
          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-white hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>回首頁</span>
        </Link>

        <Link
          href={`/novashield/admin?shop=${encodeURIComponent(shop.shopId)}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-amber-300 hover:text-amber-700"
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span>店家後台設定</span>
        </Link>
      </div>

      <CustomerFeedbackFlow shop={shop} />
    </div>
  );
}
