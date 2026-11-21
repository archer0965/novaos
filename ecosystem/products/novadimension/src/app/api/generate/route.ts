import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put } from "@vercel/blob";
import {
  consumeCredit,
  getAccount,
  hasAccess,
  saveAccount,
} from "@/lib/credits";
import {
  buildInteriorPrompts,
  generateWithFal,
  resolveRoomTypeId,
  resolveStyleId,
} from "@/lib/fal-generate";
import type { AiStyleId, RoomTypeId } from "@/lib/constants";

const GUEST_COOKIE = "nd_credits";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MOCK_OUTPUT = "/case-living.jpg";

type AnalysisReport = {
  styleLabel: string;
  roomLabel: string;
  flow: string;
  lighting: string;
  palette: string[];
  suggestions: string[];
  renderNote: string;
};

function buildAnalysis(
  styleId: AiStyleId,
  styleLabel: string,
  roomLabel: string,
): AnalysisReport {
  const byStyle: Record<
    AiStyleId,
    Omit<AnalysisReport, "styleLabel" | "roomLabel">
  > = {
    "cream-jp": {
      flow: "建議維持沙發背牆為主軸，電視牆與玄關動線分開，避免穿越沙發前方。",
      lighting: "採光以窗邊漫射為主；建議加一盞暖白落地燈補足夜間層次。",
      palette: ["#F5EDE3", "#D4C4B0", "#8A7A6A", "#2C2A28"],
      suggestions: [
        "選低背沙發拉開視線高度",
        "用圓弧茶几柔化直角動線",
        "窗簾採雙層紗簾＋遮光簾",
      ],
      renderNote: "擬真圖偏向奶油牆面與淺木地板，強調溫潤居家感。",
    },
    "modern-minimal": {
      flow: "精簡動線：入口→沙發→窗景，減少零散矮櫃阻擋。",
      lighting: "保留大面積自然光，夜間以軌道燈／壁燈點狀照明。",
      palette: ["#F7F5F2", "#C9C4BC", "#6E6A64", "#1A1A1A"],
      suggestions: [
        "隱藏收納取代開放層架",
        "家具高度統一減少視覺雜訊",
        "留白牆面作為焦點背景",
      ],
      renderNote: "擬真圖強調乾淨量體與低彩度材質對比。",
    },
    "nordic-wood": {
      flow: "沿牆配置收納，中央保留活動空間，強化客廳與陽台串聯。",
      lighting: "木材反射暖光；建議 2700K–3000K 色溫營造北歐氛圍。",
      palette: ["#F3E8D8", "#C8A882", "#7D8B74", "#3E3A36"],
      suggestions: [
        "淺橡木地板延伸空間感",
        "編織地毯界定沙發區",
        "綠色植栽平衡木質比重",
      ],
      renderNote: "擬真圖以木質家具與織品堆疊呈現北歐層次。",
    },
    bauhaus: {
      flow: "以幾何區塊劃分功能區，動線走直線最短路徑。",
      lighting: "強調光影對比；可用色塊燈具作為視覺錨點。",
      palette: ["#F2EFE8", "#C45C26", "#2F5D8A", "#1E1E1E"],
      suggestions: [
        "圓形與方形家具對位擺放",
        "單色焦點椅提升識別度",
        "金屬細節點綴結構感",
      ],
      renderNote: "擬真圖突出色塊、線條與機能家具。",
    },
    industrial: {
      flow: "開放式配置，沙發與中島／電視牆形成三角動線。",
      lighting: "混用冷暖光源；吊燈聚焦餐桌／茶几區域。",
      palette: ["#E8E2D8", "#8B8680", "#5C4A3A", "#222222"],
      suggestions: [
        "裸感材質（混凝土／鐵件）適度使用",
        "深色沙發壓住空間重心",
        "暖光燈具柔化工業冷感",
      ],
      renderNote: "擬真圖保留結構質感並加入軟質布料平衡。",
    },
  };

  return { styleLabel, roomLabel, ...byStyle[styleId] };
}

async function parseRequest(request: Request): Promise<{
  imageUrl: string;
  style: string;
  roomType: string;
  accountId: string;
  wantMock: boolean;
}> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const style = String(form.get("style") || "");
    const roomType = String(form.get("roomType") || form.get("space") || "living");
    const accountId = String(form.get("accountId") || "guest");
    const wantMock = String(form.get("mock") || "") === "1";
    const existingUrl = String(form.get("imageUrl") || "");
    const file = form.get("image");

    if (existingUrl.startsWith("http") || existingUrl.startsWith("data:")) {
      return { imageUrl: existingUrl, style, roomType, accountId, wantMock };
    }

    if (!(file instanceof File) || file.size === 0) {
      throw Object.assign(new Error("MISSING_IMAGE"), { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw Object.assign(new Error("IMAGE_TOO_LARGE"), { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      throw Object.assign(new Error("INVALID_IMAGE_TYPE"), { status: 400 });
    }

    const imageUrl = await toUsableImageUrl(file);
    return { imageUrl, style, roomType, accountId, wantMock };
  }

  const body = (await request.json()) as {
    imageUrl?: string;
    style?: string;
    roomType?: string;
    accountId?: string;
    mock?: boolean;
  };

  if (!body.imageUrl) {
    throw Object.assign(new Error("MISSING_IMAGE"), { status: 400 });
  }

  return {
    imageUrl: body.imageUrl,
    style: String(body.style || ""),
    roomType: String(body.roomType || "living"),
    accountId: String(body.accountId || "guest"),
    wantMock: Boolean(body.mock),
  };
}

async function toUsableImageUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const dataUrl = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;

  // Prefer public Blob URL for fal.ai (needs fetchable image_url)
  if (token) {
    try {
      const uploaded = await put(
        `generate/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`,
        buffer,
        {
          access: "public",
          token,
          contentType: file.type || "image/jpeg",
          addRandomSuffix: true,
        },
      );
      return uploaded.url;
    } catch (err) {
      console.warn("blob upload failed, falling back to data URL", err);
    }
  }

  return dataUrl;
}

async function loadAccount(accountId: string) {
  let account = await getAccount(accountId);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const jar = await cookies();
    const raw = jar.get(GUEST_COOKIE)?.value;
    if (raw != null && raw !== "") {
      const n = Number(raw);
      if (Number.isFinite(n)) account = { ...account, credits: n };
    }
  }

  return account;
}

export async function POST(request: Request) {
  try {
    const input = await parseRequest(request);

    const styleId = resolveStyleId(input.style);
    if (!styleId) {
      return NextResponse.json(
        { error: "請選擇有效風格", code: "INVALID_STYLE" },
        { status: 400 },
      );
    }

    const roomTypeId = resolveRoomTypeId(input.roomType) ?? ("living" as RoomTypeId);

    let account = await loadAccount(input.accountId);
    if (!hasAccess(account)) {
      return NextResponse.json(
        {
          error: "Credit 不足，請至方案區購買或訂閱後再試",
          code: "NO_CREDIT",
        },
        { status: 402 },
      );
    }

    const { prompt, negativePrompt, styleLabel, roomLabel } =
      buildInteriorPrompts({ styleId, roomTypeId });

    const falKey = process.env.FAL_KEY?.trim();
    let outputUrl: string;
    let previewMode = false;
    let requestId: string | undefined;
    let message: string | undefined;

    if (!falKey) {
      /*
       * Mock fallback（本地／尚未設定金鑰時）：
       * - 設 ALLOW_GENERATE_MOCK=1，或請求帶 mock:true，回傳示範圖方便測 UI
       * - 否則回傳清楚錯誤，提醒設定 process.env.FAL_KEY
       */
      const allowMock =
        process.env.ALLOW_GENERATE_MOCK === "1" ||
        input.wantMock ||
        process.env.NODE_ENV !== "production";

      if (!allowMock) {
        return NextResponse.json(
          {
            error:
              "未設定 FAL_KEY。請在 Vercel／.env 加入 fal.ai API Key 後再試。",
            code: "NO_FAL_KEY",
          },
          { status: 503 },
        );
      }

      outputUrl = MOCK_OUTPUT;
      previewMode = true;
      message =
        "未設定 FAL_KEY，已使用示範圖（mock）。請在環境變數設定 FAL_KEY 以啟用真實 AI 生成。";
    } else {
      try {
        const falResult = await generateWithFal({
          imageUrl: input.imageUrl,
          prompt,
          negativePrompt,
        });
        outputUrl = falResult.outputUrl;
        requestId = falResult.requestId;
        message = "AI 擬真圖已生成";
      } catch (err) {
        const msg = err instanceof Error ? err.message : "FAL_FAILED";
        if (msg === "FAL_NO_OUTPUT") {
          return NextResponse.json(
            { error: "AI 未回傳圖片，請稍後再試", code: "FAL_NO_OUTPUT" },
            { status: 502 },
          );
        }
        console.error("fal generate failed", err);
        return NextResponse.json(
          {
            error: "AI 生成逾時或失敗，請稍後再試",
            code: "FAL_TIMEOUT",
          },
          { status: 504 },
        );
      }
    }

    // 成功後才扣點
    account = consumeCredit(account);
    await saveAccount(account);

    const analysis = buildAnalysis(styleId, styleLabel, roomLabel);

    const response = NextResponse.json({
      ok: true,
      outputUrl,
      resultImageUrl: outputUrl,
      previewMode,
      requestId,
      prompt,
      negativePrompt,
      analysis,
      credits: {
        remaining: account.credits,
        subscriptionEndsAt: account.subscriptionEndsAt,
      },
      message,
    });

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      response.cookies.set(GUEST_COOKIE, String(account.credits), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 180,
      });
    }

    return response;
  } catch (error) {
    const code = error instanceof Error ? error.message : "GENERATE_FAILED";
    if (code === "MISSING_IMAGE") {
      return NextResponse.json(
        { error: "請上傳房間照片或提供 imageUrl", code },
        { status: 400 },
      );
    }
    if (code === "IMAGE_TOO_LARGE") {
      return NextResponse.json(
        { error: "圖片請小於 8MB", code },
        { status: 400 },
      );
    }
    if (code === "INVALID_IMAGE_TYPE") {
      return NextResponse.json(
        { error: "請上傳圖片檔（JPG / PNG / WEBP）", code },
        { status: 400 },
      );
    }
    console.error("generate error", error);
    return NextResponse.json(
      { error: "生成失敗，請稍後再試", code: "GENERATE_FAILED" },
      { status: 500 },
    );
  }
}
