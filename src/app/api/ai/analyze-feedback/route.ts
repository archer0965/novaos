import { NextResponse } from "next/server";
import {
  AI_ANALYZE_SYSTEM_PROMPT,
  generateSmartMockAnalysis,
  normalizeAiAnalysis,
  type AiAnalyzeApiResponse,
} from "@/lib/novashield/aiAnalyzer";
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
          error: "請求過於頻繁，請於 1 分鐘後再試。",
        },
        { status: 429 },
      );
    }

    let body: { feedbackText?: unknown; shopName?: unknown };
    try {
      body = (await request.json()) as {
        feedbackText?: unknown;
        shopName?: unknown;
      };
    } catch {
      return NextResponse.json<AiAnalyzeApiResponse>(
        { ok: false, mode: "mock", error: "無效的 JSON 請求內容。" },
        { status: 400 },
      );
    }

    const feedbackText =
      typeof body.feedbackText === "string" ? body.feedbackText.trim() : "";
    const shopName =
      typeof body.shopName === "string" ? body.shopName.trim().slice(0, 80) : "";

    if (!feedbackText) {
      return NextResponse.json<AiAnalyzeApiResponse>(
        { ok: false, mode: "mock", error: "請輸入顧客負評或客訴原文。" },
        { status: 400 },
      );
    }

    if (feedbackText.length > 1500) {
      return NextResponse.json<AiAnalyzeApiResponse>(
        { ok: false, mode: "mock", error: "客訴文字請控制在 1,500 字以內。" },
        { status: 400 },
      );
    }

    const fallbackResult = generateSmartMockAnalysis(feedbackText, shopName);
    const openAiKey = (process.env.OPENAI_API_KEY || "").trim();

    if (!openAiKey) {
      return NextResponse.json<AiAnalyzeApiResponse>({
        ok: true,
        mode: "mock",
        result: fallbackResult,
      });
    }

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
              {
                role: "system",
                content: AI_ANALYZE_SYSTEM_PROMPT,
              },
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

      if (!response.ok) {
        return NextResponse.json<AiAnalyzeApiResponse>({
          ok: true,
          mode: "mock",
          result: fallbackResult,
        });
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) {
        return NextResponse.json<AiAnalyzeApiResponse>({
          ok: true,
          mode: "mock",
          result: fallbackResult,
        });
      }

      const parsed = JSON.parse(rawContent) as Record<string, unknown>;
      const normalized = normalizeAiAnalysis(parsed, fallbackResult);

      return NextResponse.json<AiAnalyzeApiResponse>({
        ok: true,
        mode: "openai",
        result: normalized,
      });
    } catch {
      return NextResponse.json<AiAnalyzeApiResponse>({
        ok: true,
        mode: "mock",
        result: fallbackResult,
      });
    }
  } catch {
    return NextResponse.json<AiAnalyzeApiResponse>(
      { ok: false, mode: "mock", error: "分析過程發生錯誤，請稍後再試。" },
      { status: 500 },
    );
  }
}
