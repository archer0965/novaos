import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "nd_admin";

function secret() {
  return (
    process.env.ADMIN_UNLOCK_SECRET ||
    process.env.BLOB_READ_WRITE_TOKEN ||
    "novadimension-admin"
  );
}

export function createAdminToken(): string {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return createHmac("sha256", secret()).update(`admin:${day}`).digest("hex");
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const expected = createAdminToken();
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
