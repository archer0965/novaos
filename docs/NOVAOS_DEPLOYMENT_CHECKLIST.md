# NovaOS 正式部署檢查清單

日期：2026-11-22（Asia/Taipei）  
**狀態：依指示「不可未經同意直接部署正式環境」——本輪未部署 hub／NovaStore 新變更；DocMate signup 修復為前一輪已上線。**

---

## A. 部署前必填（需你確認）

- [ ] 批准部署哪些專案：`novaos` / `docmate-ai` / `novastore`  
- [ ] 批准套用 DB migration `026_profiles_lock_billing_columns.sql`（建議先 staging）  
- [ ] 確認 `ECPAY_STAGE` 正式值  
- [ ] 確認 Supabase project 對照表  
- [ ] 拓脈／SubKeeper 是否暫緩（無 Git）  
- [ ] 誤建專案 `vbiz` 是否刪除  

---

## B. 各站 Build／品質

| 檢查 | Hub | DocMate | NovaStore | 拓脈 | SubKeeper |
|------|-----|---------|-----------|------|-----------|
| `tsc` / build | 待跑後勾 | 待跑 | 待跑 | ⛔ | ⛔ |
| ESLint | 待跑 | 待跑 | 待跑 | ⛔ | ⛔ |
| 依賴鎖定 | package-lock 有 | 有 | 有 | ⛔ | ⛔ |
| 環境變數齊全 | 見下 | 見下 | 見下 | ⛔ | ⛔ |

### Hub 必要 env（名稱 only）

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ECPAY_*`, `LINE_*`, `CRON_SECRET`, `ADMIN_EMAILS`, `NEXT_PUBLIC_BASE_URL`, 可選 `RESEND_*`, `NEXT_PUBLIC_COMPANY_*`

### DocMate

`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, 可選 `NEXT_PUBLIC_NOVAOS_URL`, `BILLING_TEST_SECRET`（正式建議關閉測試路徑）

### NovaStore

與 Hub 類似之 Supabase／ECPay／LINE 組

---

## C. 連線與 SEO

| 項目 | Hub | 其他 |
|------|-----|------|
| 正式網域 | paycheck.com.de | *.vercel.app 或自訂 |
| SSL | Vercel 預設 | 同 |
| Sitemap | `/sitemap.xml` 含 legal | DocMate／Store 各自確認 |
| robots | 已允許 legal 路徑 | 各自確認 |
| OG／Metadata | Hub layout 有 | 各自 |
| 404／error | Hub 有 not-found | DocMate 有 |

---

## D. 部署手順（批准後執行）

1. Staging 套用 `026` → 驗證無法自助改 plan  
2. `npm run build` 各 repo  
3. `vercel deploy --prod` **僅在你回覆同意後**  
4. Smoke：首頁、登入頁、`/legal`、DocMate `/signup`  
5. 回寫 `NOVAOS_TEST_REPORT.md`

---

## E. 回滾

- Vercel 上一版 Instant Rollback  
- DB trigger：保留 `DROP TRIGGER ...` 回滾腳本（套用前備妥）  
- **禁止**用正式資料做破壞性回滾測試

---

## F. 本輪部署狀態

| 專案 | 動作 |
|------|------|
| Hub 命名／法律／migration 檔 | **已 commit 待你批准部署** |
| DocMate signup | 前一輪已 production |
| NovaStore | 無本輪必部變更 |
| 拓脈／SubKeeper | 無法部署原始碼變更 |
