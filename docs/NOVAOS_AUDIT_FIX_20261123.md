# NovaOS 六站稽核修復紀錄（2026-11-23）

## 已部署

| 站點 | 正式網址 | 分支 | 狀態 |
|------|----------|------|------|
| NovaOS 主站 | https://paycheck.com.de | `cursor/novaos-audit-fix-4712` | 已 prod 部署；OG 文案＋三模組旗艦標示＋早鳥名額誠實顯示＋ECPay 預檢 |
| DocMate AI | https://docmate-ai-one.vercel.app | `cursor/novaos-audit-fix-4712` | 已 prod 部署；團隊功能標規劃中、額度冪等／失敗釋放、hub receive |

## 進行中（子代理）

- NovaStore：收款文案、訂單狀態、idempotency／庫存
- 拓脈：試用天數／早鳥、併發預約、通知
- 訂閱管家：命名、Demo、匯出刪除
- 拓維空間：成本毛利表、Credit、2D／案例標示

## 已知未完成（需營運）

- 綠界正式憑證 `3284622` 仍回 **10200074**（Hash 不成對或金流未開通）。程式已預檢並回明確錯誤；**須於綠界廠商專區重抓全方位金流 Hash 並更新 Vercel ECPAY_***。
- 主站／子站功能分支需合併至各 repo `main` 後，Vercel Git 自動部署才會長期對齊（本次為 CLI prod 部署）。
