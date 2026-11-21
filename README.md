# NovaStore

代購/團購獨立賣場與自動對帳平台（NovaStore）。

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui + Lucide
- Supabase（Auth / PostgreSQL / RLS）
- LINE Messaging API
- 綠界 ECPay
- Vercel Ready

## 快速開始

```bash
cp .env.example .env.local
# 填入 Supabase / LINE / ECPay 變數

npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

## Supabase 設定

1. 建立專案，於 SQL Editor 執行 `supabase/migrations/001_initial_schema.sql`
2. Authentication → Providers 啟用 Email
3. 將 Project URL、anon key、service_role key 填入 `.env.local`
4. （建議）Authentication → URL Configuration 加入：
   - Site URL：`http://localhost:3000`
   - Redirect：`http://localhost:3000/auth/callback`

## 主要路由

| 路徑 | 說明 |
|------|------|
| `/` | Landing |
| `/signup` `/login` | 賣家註冊／登入 |
| `/dashboard` | 對帳儀表板（含社群範本） |
| `/dashboard/admin` | 管理者營運統計（僅白名單 Email） |
| `/dashboard/settings` | 店名／銀行／LINE／升級 Pro |
| `/p/[sellerId]` | 買家公開回報頁（`/pay/[sellerId]` 同義轉址） |
| `/terms` `/privacy` `/contact` | 條款／個資／客服頁 |
| `/api/report/submit` | 買家提交對帳（寫入 DB + LINE） |
| `/api/keep-alive` | Supabase keep-alive（Vercel Cron 每 3 天） |
| `/api/cron/expiry-reminders` | 方案到期前 3／1 天提醒（每日 Cron） |
| `/api/checkout` | 建立綠界訂單 |
| `/api/checkout/callback` | 綠界付款結果 |
| `/api/upgrade` | 有效期內升級差價報價／補差價付款 |

## Supabase Keep-Alive

- `vercel.json` 排程：`0 0 */3 * *` → `GET /api/keep-alive`
- 對 `profiles` 做輕量 `select`，避免免費專案因閒置被暫停
- 建議在 Vercel 設定 `CRON_SECRET`；Vercel Cron 會帶 `Authorization: Bearer <CRON_SECRET>`

## 訂閱到期與續費累加

- 綠界付款成功後寫入／延長 `profiles.expires_at`：未過期自原到期日累加；已過期自當下起算
- 每日 Cron `0 1 * * *` → `/api/cron/expiry-reminders`：到期前 3 天／1 天寄 Resend 提醒（可選 LINE）
- 後台顯示方案等級、精確到期日，以及即將到期（黃）／已到期（紅）警示
- Resend 寄件者：`NovaStore <noreply@paycheck.com.de>`（網域已驗證）

## 方案升級差價折抵

- `GET/POST /api/upgrade`：有效期內升級時依剩餘天數計算折抵與補差價
- 綠界 callback `upgrade:<plan>:<cycle>`：只更新 `plan_type`，**保留原 `expires_at`**
- 設定頁升級時會彈窗提示剩餘天數與應付補差價

## 首頁 FAQ

- Landing 定價方案下方有可折疊「常見問題」Accordion（上手、買家體驗、試用不扣款、升級折抵、提早續費累加）

## 買家回報防失聯

- 聯絡方式（IG／Threads／LINE）與轉帳銀行為必填
- 後台可標記「⚠️ 異常／需聯繫」；IG／Threads 可一鍵開啟個人頁，並可複製整筆回報資訊
- Schema：`supabase/migrations/006_buyer_contact_transfer_bank.sql`

## 綠界環境切換

- 開發（`NODE_ENV!==production`）或 `ECPAY_STAGE=true`：自動使用測試特店 `2000132`
- 正式部署設 `ECPAY_STAGE=false`（或省略且 `NODE_ENV=production`）並填入正式 `ECPAY_*`

## LINE 推播

1. 到 [LINE Developers](https://developers.line.biz/) 建立 Provider → Messaging API Channel  
2. 發行 **Channel access token (long-lived)**，並複製 **Channel secret**  
3. Vercel 環境變數設定：
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_CHANNEL_SECRET`
4. Messaging API → Webhook URL：  
   `https://paycheck.com.de/api/line/webhook`  
   並開啟 **Use webhook**
5. 賣家加官方帳號為好友並傳訊 → 機器人回覆 User ID → 貼到後台設定  
6. 後台可按「測試 LINE 推播」驗證

## 綠界 ECPay

預設使用測試商店：

- MerchantID `2000132`
- 測試信用卡等請參考綠界文件

正式環境請更換 `ECPAY_*`，並將 `ReturnURL` 設為公開 HTTPS（Vercel 網域）。

## 部署至 Vercel

**永久固定正式網址：** https://paycheck.com.de  
（鎖定於 `deploy.config.json`；之後任何更新都部署到此網址，**永久不變更**、勿另建新專案。）

```bash
export VERCEL_TOKEN=...
./scripts/deploy-vercel.sh
```

1. 環境變數對齊 `.env.example`
2. `NEXT_PUBLIC_BASE_URL=https://paycheck.com.de`
3. Cloudflare DNS 指向 Vercel（見下方）
4. Supabase Auth（必做）：
   - Site URL：`https://paycheck.com.de`
   - Redirect URLs：`https://paycheck.com.de/auth/callback`
5. LINE Webhook（必做）：`https://paycheck.com.de/api/line/webhook`  
   或：`LINE_CHANNEL_ACCESS_TOKEN=... ./scripts/set-line-webhook.sh`

### Cloudflare DNS（目前 nameserver 在 Cloudflare）

在 Cloudflare → paycheck.com.de → DNS 新增／調整（建議 **DNS only**，關閉橘色雲 Proxy）：

| Type | Name | Content |
|------|------|---------|
| CNAME | `@` | `cname.vercel-dns.com` |
| CNAME | `www` | `cname.vercel-dns.com` |

（若 Cloudflare 不允許根網域 CNAME，改用 Vercel 顯示的 A 記錄：`216.198.79.1`、`64.29.17.1`）

## 方案限制

- 新註冊：7 天全功能免費試用（`trial_ends_at`）
- 免費體驗版：每月 5 筆
- 升級版：每月 30 筆，月繳 $149／半年繳 $799／年繳 $1490
- 尊享版：每月 100 筆，月繳 $299／半年繳 $1610／年繳 $2990
- 無限尊享版：無限筆數，月繳 $499／半年繳 $2690／年繳 $4990
- 尊享版／無限尊享版：一鍵自動對帳（智慧勾稽）— 貼上銀行明細自動核對金額＋後五碼
- 額度以 `usage_month` + `monthly_usage_count` 計算（台北時區換月重置）
