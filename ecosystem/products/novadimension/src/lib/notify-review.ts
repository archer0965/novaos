import { Resend } from "resend";
import type { Review } from "@/lib/reviews";

const NOTIFY_EMAIL = "archer0965@gmail.com";

export async function notifyNewReview(review: Review): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("缺少 RESEND_API_KEY，無法寄送評論通知。");
  }

  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  const createdAt = new Date(review.createdAt).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
  });

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "拓維空間NovaDimension <onboarding@resend.dev>",
    to: [NOTIFY_EMAIL],
    subject: `【拓維空間】收到新客戶評論｜${review.name}`,
    text: [
      "網站有新的客戶評論：",
      "",
      `暱稱：${review.name}`,
      `空間類型：${review.space}`,
      `評分：${review.rating}/5 ${stars}`,
      `內容：${review.quote}`,
      `時間：${createdAt}（台北時間）`,
      "",
      "查看網站：https://novadimension.vercel.app/#testimonials",
    ].join("\n"),
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1c1f24;">
        <h2 style="margin: 0 0 12px;">網站有新的客戶評論</h2>
        <p><strong>暱稱：</strong>${escapeHtml(review.name)}</p>
        <p><strong>空間類型：</strong>${escapeHtml(review.space)}</p>
        <p><strong>評分：</strong>${review.rating}/5 ${stars}</p>
        <p><strong>內容：</strong>${escapeHtml(review.quote)}</p>
        <p><strong>時間：</strong>${escapeHtml(createdAt)}（台北時間）</p>
        <p><a href="https://novadimension.vercel.app/#testimonials">前往客戶好評區</a></p>
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
