import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Ported from archer0965/docmate-ai (Nova AI Doc) Gemini fallback client.
 * Override first choice via GEMINI_MODEL; automatically retries fallback models
 * on 404/429/503 without mutating production env vars.
 */
const MODEL_FALLBACKS = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash",
] as const;

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
