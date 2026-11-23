# NovaOS 六站稽核修復紀錄（2026-11-23）

Branch（各 repo）：`cursor/novaos-audit-fix-4712`

## 正式部署網址（已 CLI prod）

| 站點 | 正式網址 | HTTP |
|------|----------|------|
| NovaOS 主站 | https://paycheck.com.de | 200 |
| NovaStore | https://novastore-omega.vercel.app | 200 |
| 拓脈預約 | https://taiwanbiz.vercel.app | 200 |
| DocMate AI | https://docmate-ai-one.vercel.app | 200 |
| 訂閱管家 | https://temporary-speedy-reef-cy4xhhu.vercel.app | 200 |
| 拓維空間 | https://novadimension.vercel.app | 200 |

## 測試

| 站點 | Build | 備註 |
|------|-------|------|
| 主站 | pass | `npm run build` + tsc |
| NovaStore | pass | |
| 拓脈 | pass | 修 opengraph-image flex 後通過 |
| DocMate | pass | |
| 訂閱管家 | pass | |
| 拓維 | pass | |

## 未完成／需營運

1. **綠界正式憑證**：MerchantID `3284622` 仍回 `10200074`。請至廠商專區「全方位金流」重抓 Hash，更新各站 Vercel `ECPAY_*`（主站／拓脈有預檢錯誤訊息）。
2. **Supabase migration**：DocMate `007_quota_release_rpc.sql`、NovaStore `025_order_idempotency_stock.sql`、訂閱管家 account delete RLS 需在正式 DB 套用後才完整生效。
3. **LINE 預覽快取**：主站 OG 已更新；LINE 可能仍快取舊標題，可試 `https://paycheck.com.de/?v=20261122-meta-v2`。
4. **E2E 真人登入／真實付款／LINE 實際推播**：本次以建置＋靜態煙測＋程式路徑加固為主，未跑完整真人金流。
5. **價格未改**：依授權未擅自變更正式價格／方案價；拓維僅新增內部 economics 報表。
