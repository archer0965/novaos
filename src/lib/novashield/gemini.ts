import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Ported from archer0965/docmate-ai (Nova AI Doc) Gemini fallback client.
 * Supports:
 * 1) Direct GEMINI_API_KEY on NovaOS (if configured)
 * 2) Authenticated HMAC-SHA256 internal bridge to docmate-ai-one.vercel.app
 *    using the shared SUPABASE_SERVICE_ROLE_KEY so existing GEMINI_API_KEY works
 *    automatically with zero manual secret duplication.
 */
const MODEL_FALLBACKS = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash",
] as const;

const DEFAULT_GEMINI_BRIDGE_URL =
  "https://docmate-ai-one.vercel.app/api/internal/novashield-analyze";

export function getGeminiApiKey(): string {
  return (process.env.GEMINI_API_KEY || "").trim();
}

export function getGeminiModelName(): string {
  return (process.env.GEMINI_MODEL || "").trim() || MODEL_FALLBACKS[0];
}

function stripJsonCodeFence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
}

export async function generateJsonWithGeminiFallback(options: {
  systemPrompt: string;
  userPrompt: string;
}): Promise<Record<string, unknown> | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const preferred = getGeminiModelName();
  const candidates = [
    preferred,
    ...MODEL_FALLBACKS.filter((m) => m !== preferred),
  ];

  const client = new GoogleGenerativeAI(apiKey);

  for (const modelName of candidates) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction: options.systemPrompt,
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(options.userPrompt);
      const rawText = result.response.text()?.trim();
      if (!rawText) {
        continue;
      }

      const parsed = JSON.parse(stripJsonCodeFence(rawText)) as Record<
        string,
        unknown
      >;
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const retryable =
        /404|not found|no longer available|high demand|503|UNAVAILABLE|429/i.test(
          msg,
        );
      console.warn(
        `[NovaShield AI] Gemini model ${modelName} failed (${retryable ? "trying fallback" : "stopping"})`,
      );
      if (!retryable) break;
    }
  }

  return null;
}

export async function generateJsonViaDocmateGeminiBridge(options: {
  systemPrompt: string;
  userPrompt: string;
}): Promise<Record<string, unknown> | null> {
  const sharedSecret = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!sharedSecret) return null;

  const bridgeUrl =
    (process.env.NOVASHIELD_GEMINI_BRIDGE_URL || "").trim() ||
    DEFAULT_GEMINI_BRIDGE_URL;

  try {
    const rawBody = JSON.stringify({
      systemPrompt: options.systemPrompt,
      userPrompt: options.userPrompt,
    });
    const timestamp = String(Date.now());
    const signature = crypto
      .createHmac("sha256", sharedSecret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    const response = await fetch(bridgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-novaos-timestamp": timestamp,
        "x-novaos-signature": signature,
      },
      body: rawBody,
    });

    if (!response.ok) {
      console.warn(
        `[NovaShield AI] Gemini bridge returned HTTP ${response.status}`,
      );
      return null;
    }

    const data = (await response.json()) as {
      ok?: boolean;
      result?: Record<string, unknown>;
    };

    return data.ok && data.result && typeof data.result === "object"
      ? data.result
      : null;
  } catch (error) {
    console.warn("[NovaShield AI] Gemini bridge call failed:", error);
    return null;
  }
}
