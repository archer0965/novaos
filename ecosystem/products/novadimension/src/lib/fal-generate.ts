import { fal } from "@fal-ai/client";
import {
  AI_STYLES,
  ROOM_TYPES,
  type AiStyleId,
  type RoomTypeId,
} from "@/lib/constants";

const STYLE_PROMPTS: Record<AiStyleId, string> = {
  "cream-jp":
    "Japanese cream aesthetic, warm ivory walls, soft beige sofa, light oak furniture, linen curtains, cozy and airy, muted pastel accents",
  "modern-minimal":
    "modern minimalist interior, clean lines, low-profile furniture, neutral palette, hidden storage, uncluttered, refined materials",
  "nordic-wood":
    "Scandinavian wood interior, light oak flooring, woven textiles, green plants, hygge atmosphere, natural daylight, soft rugs",
  bauhaus:
    "Bauhaus interior design, geometric furniture, primary color accents, functional forms, bold shapes, structured composition",
  industrial:
    "industrial loft interior, exposed textures, metal accents, dark sofa, warm pendant lights, raw materials balanced with soft fabrics",
};

const ROOM_PROMPTS: Record<RoomTypeId, string> = {
  living: "living room soft furnishing redesign",
  bedroom: "bedroom soft furnishing redesign",
  entry: "entryway foyer soft furnishing redesign",
  dining: "dining room soft furnishing redesign",
  study: "home study / reading nook soft furnishing redesign",
};

export const DEFAULT_NEGATIVE_PROMPT = [
  "blurry",
  "low quality",
  "distorted architecture",
  "warped walls",
  "extra furniture overlapping",
  "people",
  "text",
  "watermark",
  "logo",
  "cartoon",
  "anime",
  "oversaturated",
  "cluttered mess",
  "changed window positions",
  "changed room layout drastically",
].join(", ");

export function resolveStyleId(style: string): AiStyleId | null {
  const byId = AI_STYLES.find((s) => s.id === style);
  if (byId) return byId.id;
  const byLabel = AI_STYLES.find((s) => s.label === style);
  return byLabel?.id ?? null;
}

export function resolveRoomTypeId(roomType: string): RoomTypeId | null {
  const byId = ROOM_TYPES.find((r) => r.id === roomType);
  if (byId) return byId.id;
  const byLabel = ROOM_TYPES.find((r) => r.label === roomType);
  return byLabel?.id ?? null;
}

export function buildInteriorPrompts(input: {
  styleId: AiStyleId;
  roomTypeId: RoomTypeId;
}) {
  const styleLabel =
    AI_STYLES.find((s) => s.id === input.styleId)?.label ?? input.styleId;
  const roomLabel =
    ROOM_TYPES.find((r) => r.id === input.roomTypeId)?.label ??
    input.roomTypeId;

  const prompt = [
    "Photorealistic interior redesign photo,",
    ROOM_PROMPTS[input.roomTypeId] + ",",
    STYLE_PROMPTS[input.styleId] + ",",
    "keep the original room structure, walls, windows, ceiling height, and camera angle,",
    "only update soft furnishings: sofa, chairs, rugs, curtains, lighting, decor, and textiles,",
    "natural lighting, high detail, architectural photography, 8k",
    `(style: ${styleLabel}, room: ${roomLabel})`,
  ].join(" ");

  return {
    prompt,
    negativePrompt: DEFAULT_NEGATIVE_PROMPT,
    styleLabel,
    roomLabel,
  };
}

export type FalGenerateResult = {
  outputUrl: string;
  requestId?: string;
  model: string;
};

/**
 * fal.ai image-to-image（結構保留偏強：較低 strength）
 * Model 可用 FAL_MODEL 覆寫，預設 flux/dev/image-to-image
 */
export async function generateWithFal(input: {
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
}): Promise<FalGenerateResult> {
  const key = process.env.FAL_KEY?.trim();
  if (!key) {
    throw new Error("NO_FAL_KEY");
  }

  fal.config({ credentials: key });

  const model =
    process.env.FAL_MODEL?.trim() || "fal-ai/flux/dev/image-to-image";
  const strength = Number(process.env.FAL_STRENGTH || "0.55");

  const result = await fal.subscribe(model, {
    input: {
      image_url: input.imageUrl,
      prompt: input.prompt,
      // 部分模型支援 negative_prompt；不支援時會被忽略或由 fal 過濾
      negative_prompt: input.negativePrompt || DEFAULT_NEGATIVE_PROMPT,
      strength: Number.isFinite(strength) ? strength : 0.55,
      num_images: 1,
      output_format: "jpeg",
      guidance_scale: 3.5,
      num_inference_steps: 28,
    },
    logs: false,
  });

  const data = result.data as {
    images?: Array<{ url?: string }>;
    image?: { url?: string };
  };

  const outputUrl = data.images?.[0]?.url || data.image?.url;
  if (!outputUrl) {
    throw new Error("FAL_NO_OUTPUT");
  }

  return {
    outputUrl,
    requestId: result.requestId,
    model,
  };
}
