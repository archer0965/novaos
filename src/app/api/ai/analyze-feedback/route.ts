import { NextResponse } from "next/server";
import {
  AI_ANALYZE_SYSTEM_PROMPT,
  generateSmartMockAnalysis,
  normalizeAiAnalysis,
  type AiAnalyzeApiResponse,
} from "@/lib/novashield/aiAnalyzer";
import {
  computeAiQuotaSnapshot,
  consumeOneAiCredit,
  normalizeAiQuotaState,
  type AiQuotaState,
} from "@/lib/novashield/aiQuota";
import {
  getNovaShieldShop,
  isSupabaseAdminConfigured,
  saveNovaShieldShopAiQuota,
} from "@/lib/novashield/db";
import type { PlanTier } from "@/lib/novashield/types";
import { sanitizeShopId } from "@/lib/novashield/validation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();

function checkUserRateLimit(userId: string, maxPerMinute = 15): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(userId);
  if (!entry || now > entry.resetAt) {
    RATE_LIMIT_MAP.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= maxPerMinute) {
    return false;
  }
  entry.count += 1;
  return true;
}

interface AnalyzeRequestBody {
  feedbackText?: unknown;
  shopId?: unknown;
  shopName?: unknown;
  /**
   * Optional client quota state for local/simulated $49 top-up sync.
   * TODO (NovaOS ECPay ledger): once real top-up checkout is enabled,
   * read topupRemaining exclusively from the verified server database ledger.
   */
  quotaState?: Partial<AiQuotaState>;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<AiAnalyzeApiResponse>(
        {
          ok: false,
          mode: "mock",
          code: "UNAUTHORIZED",
          error: "請先登入拓新雲端帳號後再使用 AI 客訴分析功能。",
        },
        { status: 401 },
      );
    }

    if (!checkUserRateLimit(user.id)) {
      return NextResponse.json<AiAnalyzeApiResponse>(
        {
          ok: false,
          mode: "mock",
          code: "RATE_LIMITED",
          error: "請求過於頻繁，請於 1 分鐘後再試。",
        },
        { status: 429 },
      );
    }

    let body: AnalyzeRequestBody;
    try {
      body = (await request.json()) as AnalyzeRequestBody;
    } catch {
      return NextResponse.json<AiAnalyzeApiResponse>(
        {
          ok: false,
          mode: "mock",
          code: "VALIDATION_ERROR",
          error: "無效的 JSON 請求內容。",
        },
        { status: 400 },
      );
    }

    const feedbackText =
      typeof body.feedbackText === "string" ? body.feedbackText.trim() : "";
    const shopId =
      typeof body.shopId === "string" ? sanitizeShopId(body.shopId) : null;
    const shopName =
      typeof body.shopName === "string" ? body.shopName.trim().slice(0, 80) : "";

    if (!feedbackText) {
      return NextResponse.json<AiAnalyzeApiResponse>(
        {
          ok: false,
          mode: "mock",
          code: "VALIDATION_ERROR",
          error: "請輸入顧客負評或客訴原文。",
        },
        { status: 400 },
      );
    }

    if (feedbackText.length > 1500) {
      return NextResponse.json<AiAnalyzeApiResponse>(
        {
          ok: false,
          mode: "mock",
          code: "VALIDATION_ERROR",
          error: "客訴文字請控制在 1,500 字以內。",
        },
        { status: 400 },
      );
    }

    // 1. Resolve authoritative plan & stored quota from Supabase (when available)
    let authoritativePlan: PlanTier = "FREE";
    let dbQuota: AiQuotaState | null = null;
    if (shopId && isSupabaseAdminConfigured()) {
      try {
        const shopRecord = await getNovaShieldShop(shopId);
        if (shopRecord) {
          authoritativePlan = shopRecord.plan;
          dbQuota = normalizeAiQuotaState(shopRecord.aiQuota);
        }
      } catch {
        // fallback cleanly to FREE + client quota state if DB lookup fails
      }
    }

    const clientQuota = normalizeAiQuotaState(body.quotaState);
    const mergedQuota: AiQuotaState = dbQuota
      ? {
          monthKey: dbQuota.monthKey,
          // Never allow client to lower server-recorded monthly usage
          monthlyUsed: Math.max(dbQuota.monthlyUsed, clientQuota.monthlyUsed),
          // Allow simulated $49 top-up credits until real ECPay top-up ledger is wired
          topupRemaining: Math.max(
            dbQuota.topupRemaining,
            clientQuota.topupRemaining,
          ),
          lastTopupOrderId:
            clientQuota.lastTopupOrderId ?? dbQuota.lastTopupOrderId ?? null,
          lastTopupAt: clientQuota.lastTopupAt ?? dbQuota.lastTopupAt ?? null,
          novaosBillingAccountId: user.id,
        }
      : {
          ...clientQuota,
          novaosBillingAccountId: user.id,
        };

    // 2. Enforce quota BEFORE calling any external LLM API
    const preCheck = computeAiQuotaSnapshot(authoritativePlan, mergedQuota);
    if (preCheck.totalRemaining <= 0) {
      return NextResponse.json<AiAnalyzeApiResponse>(
        {
          ok: false,
          mode: "mock",
          code: "QUOTA_EXCEEDED",
          quota: preCheck,
          quotaState: mergedQuota,
          error:
            "本月與加購 AI 分析次數已用完，請購買「$49 加購 30 次」或升級專業版。",
        },
        { status: 403 },
      );
    }

    // 3. Run LLM analysis (or structured mock fallback if OPENAI_API_KEY unset)
    const fallbackResult = generateSmartMockAnalysis(feedbackText, shopName);
    const openAiKey = (process.env.OPENAI_API_KEY || "").trim();

    let finalMode: "openai" | "mock" = "mock";
    let finalResult = fallbackResult;

    if (openAiKey) {
      const model = (process.env.OPENAI_MODEL || "gpt-4o-mini").trim();
      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openAiKey}`,
            },
            body: JSON.stringify({
              model,
              temperature: 0.4,
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: AI_ANALYZE_SYSTEM_PROMPT },
                {
                  role: "user",
                  content: shopName
                    ? `門市名稱：${shopName}\n顧客負評原文：\n${feedbackText}`
                    : `顧客負評原文：\n${feedbackText}`,
                },
              ],
            }),
          },
        );

        if (response.ok) {
          const data = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const rawContent = data.choices?.[0]?.message?.content;
          if (rawContent) {
            const parsed = JSON.parse(rawContent) as Record<string, unknown>;
            finalResult = normalizeAiAnalysis(parsed, fallbackResult);
            finalMode = "openai";
          }
        }
      } catch {
        // Keep structured fallback result cleanly
      }
    }

    // 4. Deduct 1 credit (monthly plan quota first, then top-up pack)
    const consumed = consumeOneAiCredit(authoritativePlan, mergedQuota);

    if (shopId && isSupabaseAdminConfigured()) {
      await saveNovaShieldShopAiQuota(shopId, consumed.nextState).catch(() => {
        // Best-effort persistence; client also stores updated quotaState
      });
    }

    return NextResponse.json<AiAnalyzeApiResponse>({
      ok: true,
      mode: finalMode,
      result: finalResult,
      quota: consumed.snapshot,
      quotaState: consumed.nextState,
    });
  } catch {
    return NextResponse.json<AiAnalyzeApiResponse>(
      { ok: false, mode: "mock", error: "分析過程發生錯誤，請稍後再試。" },
      { status: 500 },
    );
  }
}
