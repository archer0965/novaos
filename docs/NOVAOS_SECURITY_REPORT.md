# NovaOS 資安報告

稽核日期：2026-11-22（Asia/Taipei）  
範圍：有原始碼之 Hub、DocMate、NovaStore；拓脈／SubKeeper = **無法檢查原始碼**。

---

## 總覽

| 嚴重度 | 數量（已確認於程式） | 建議 |
|--------|----------------------|------|
| P0 | 1 類（跨 hub/novastore schema） | 立即準備套用 DB 防護 |
| P1 | 多項 | 本迭代排程 |
| P2–P3 | 多項 | 規劃改善 |

未在正式環境以攻擊流量驗證；以下為**程式碼審查**結論。

---

## P0

### SEC-P0-01 使用者可自行竄改訂閱／權益欄位

- **位置：** `profiles` RLS `Users can update own profile`（hub／NovaStore `001_initial_schema.sql`）僅檢查 `auth.uid() = id`，**無欄位限制**。
- **影響：** 持有 anon key + 登入 session 的客戶端可嘗試把 `plan_type`、`expires_at`、`is_early_bird`、`is_ambassador`、`active_modules`、`referral_credit_balance` 等改為付費權益。
- **前端 PATCH 白名單不能當防護**（可被直接打 Supabase REST）。
- **修復提案：** `supabase/migrations/026_profiles_lock_billing_columns.sql`（BEFORE UPDATE trigger；`service_role` 繞過）。
- **狀態：** 檔案已寫入 repo；**尚未**套用正式資料庫（需你批准）。
- **測試建議（staging）：** 以一般使用者 JWT 對 `profiles` 更新 `plan_type` 應失敗；以 service role／checkout callback 應成功。

---

## P1

| ID | 風險 | 位置／說明 |
|----|------|------------|
| SEC-P1-01 | Booking 公開 INSERT `WITH CHECK (true)` | Hub migration；可繞過 API 灌預約 |
| SEC-P1-02 | LINE channel token/secret 存於 `profiles` | 帳號外洩＝官方帳號被接管 |
| SEC-P1-03 | Cron 允許 `?secret=` | 日誌／Referer 洩密 |
| SEC-P1-04 | Admin 僅 Email allowlist | 無 MFA／無 DB role |
| SEC-P1-05 | DocMate 付費權益同步依賴 hub 寫入 | 若未寫 `docmate_profiles`＝付費可被繞過或失效 |
| SEC-P1-06 | NovaStore `/api/orders/track` 以電話／姓名查詢 | 跨賣家狀態列舉風險 |
| SEC-P1-07 | Checkout 預先解鎖 modules | 未付款可能享有模組 |

---

## P2

| ID | 風險 |
|----|------|
| SEC-P2-01 | DocMate 記憶體 rate-limit（多實例失效） |
| SEC-P2-02 | DocMate CSP 含 unsafe-inline/eval |
| SEC-P2-03 | ECPay stage 預設值出現在 `.env.example`／程式常數 |
| SEC-P2-04 | `shop_public` 暴露銀行資訊給買家（產品需求，需監控濫用） |
| SEC-P2-05 | DocMate 005 migration 可能弱化 004 的 parent-ownership INSERT 政策 |
| SEC-P2-06 | 測試 billing confirm API 若誤設 secret 仍可達 |

---

## P3

- NEXT_PUBLIC_* 僅放公開值（正確）；勿把 `SERVICE_ROLE` 放 NEXT_PUBLIC（目前範例正確）。
- ECPay CheckMac／LINE signature 驗證**有實作**（正向控制）。
- PDF 上傳有大小／頁數／MIME 限制（DocMate）；惡意 PDF 解析仍屬供應鏈風險，需持續限縮。

---

## 檢查清單對照（要求第 11 階段）

| 檢查項 | Hub | DocMate | NovaStore | 拓脈 | SubKeeper |
|--------|-----|---------|-----------|------|-----------|
| API 權限驗證 | 部分 ✅ | ✅ middleware+API | ✅ | 無法檢查 | 無法檢查 |
| 資料隔離 RLS | ⚠️ profiles 過寬 | ✅ 設計良好 | ⚠️ 同 profiles | — | — |
| Admin 權限 | Email list | N/A | Email list | — | — |
| Rate limit | 弱／部分 | 記憶體 | 弱 | — | — |
| SQLi | 參數化 ORM 為主 | 同 | 同 | — | — |
| XSS | React 預設逃逸；富文本少 | 同 | 同 | — | — |
| CSRF | Cookie Auth 需持續檢視 | 同 | 同 | — | — |
| 上傳限制 | N/A（hub AI 弱） | ✅ | URL 圖為主 | — | — |
| Webhook 驗證 | LINE/ECPay ✅ | N/A | ✅ | — | — |
| 付費權限伺服器端 | ⚠️ 可被 profiles 繞過 | ⚠️ 同步風險 | ⚠️ 同 profiles | — | — |
| SERVICE_ROLE 未進 PUBLIC | ✅ 範例正確 | ✅ | ✅ | — | — |

---

## 需要你提供

1. Staging Supabase 供套用 `026` 驗證  
2. 是否允許正式套用 `026`  
3. 拓脈／SubKeeper 原始碼以補齊資安表  
4. 正式環境是否共用同一 Supabase（影響爆炸半徑評估）
