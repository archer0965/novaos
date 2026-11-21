import { Resend } from "resend";

const NOTIFY_EMAIL = "archer0965@gmail.com";

export type ConsultationPayload = {
  name: string;
  instagram: string;
  spaceType: string;
  spaceNote: string;
};

export async function notifyNewConsultation(
  payload: ConsultationPayload,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("缺少 RESEND_API_KEY，無法寄送預約通知。");
  }

  const createdAt = new Date().toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
  });

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "拓維空間NovaDimension <onboarding@resend.dev>",
    to: [NOTIFY_EMAIL],
    subject: `【拓維空間】新預約諮詢｜${payload.name}`,
    text: [
      "網站有新的預約諮詢：",
      "",
      `稱呼：${payload.name}`,
      `IG：${payload.instagram}`,
      `空間類型：${payload.spaceType}`,
      `現況說明：${payload.spaceNote || "（未填寫）"}`,
      `時間：${createdAt}（台北時間）`,
      "",
      "請至 IG 私訊聯繫客戶。",
    ].join("\n"),
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1c1f24;">
        <h2 style="margin: 0 0 12px;">網站有新的預約諮詢</h2>
        <p><strong>稱呼：</strong>${escapeHtml(payload.name)}</p>
        <p><strong>IG：</strong>${escapeHtml(payload.instagram)}</p>
        <p><strong>空間類型：</strong>${escapeHtml(payload.spaceType)}</p>
        <p><strong>現況說明：</strong>${escapeHtml(payload.spaceNote || "（未填寫）")}</p>
        <p><strong>時間：</strong>${escapeHtml(createdAt)}（台北時間）</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
