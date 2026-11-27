/**
 * Unified brand trust surfaces for NovaOS ecosystem.
 * All product sites should import these URLs (or mirror the constants).
 */

export const NOVAOS_HUB_URL = "https://paycheck.com.de";

/** Official LINE customer service — single entry for all six products. */
export const NOVAOS_LINE_ID = "@469uykad";
export const NOVAOS_LINE_URL = "https://line.me/R/ti/p/@469uykad";

export const NOVAOS_SUPPORT_EMAIL = "archer0965@gmail.com";

export const NOVAOS_LEGAL = {
  hub: `${NOVAOS_HUB_URL}/legal`,
  terms: `${NOVAOS_HUB_URL}/terms`,
  privacy: `${NOVAOS_HUB_URL}/privacy`,
  refund: `${NOVAOS_HUB_URL}/refund`,
  contact: `${NOVAOS_HUB_URL}/contact`,
  memberCenter: `${NOVAOS_HUB_URL}/dashboard/pass`,
} as const;

export const NOVAOS_ECOSYSTEM_PRODUCTS = [
  {
    id: "hub",
    name: "拓新雲端 NovaOS",
    href: NOVAOS_HUB_URL,
    role: "會員中心／付款中樞",
  },
  {
    id: "novastore",
    name: "NovaStore",
    href: "https://novastore-omega.vercel.app",
    role: "賣場與對帳",
  },
  {
    id: "booking",
    name: "拓脈預約",
    href: "https://taiwanbiz.vercel.app",
    role: "預約與排班",
  },
  {
    id: "novashield",
    name: "Nova商譽寶",
    href: "https://novashield-mauve.vercel.app",
    role: "門市好評引導與客訴防護",
  },
  {
    id: "dimension",
    name: "拓維空間",
    href: "https://novadimension.vercel.app",
    role: "AI 空間擬真預覽",
  },
  {
    id: "subkeeper",
    name: "訂閱管家",
    href: "https://temporary-speedy-reef-cy4xhhu.vercel.app",
    role: "個人訂閱開銷（永久免費）",
  },
] as const;
