# NovaOS 訂閱／金流導向核對（2026-11-23）

商店代號：**3284622**（正式 `payment.ecpay.com.tw`）

> HashKey／HashIV 已寫入主站與拓脈 Vercel Production／Preview；本文件不記錄密鑰內容。

## 探針結果

| 項目 | 結果 |
|------|------|
| CheckMac 官方範例 | OK |
| 測試環境 MerchantID 2000132 | OK（可進入付款頁） |
| 正式 3284622 + 本次提供 Hash（ALL／Credit／ATM／CVS） | **失敗 10200074**「找不到加密金鑰…」 |

結論：程式導向與 CheckMac 正確；**綠界端尚未接受此商店的全方位金流金鑰組合**（金鑰不成對，或收款方式未開通）。需在廠商專區「系統介接設定 → **全方位金流**」重新確認 Hash，並確認信用卡／ATM／超商等已開通。

## 誰打綠界？

| 產品 | 訂閱／付費入口 | 實際建立綠界訂單 | ReturnURL（伺服器回調） | ClientBack／結果頁 |
|------|----------------|------------------|-------------------------|-------------------|
| NovaOS 主站方案 | `/dashboard/pass` → `/api/checkout` | **主站** | `https://paycheck.com.de/api/checkout/callback` | `/dashboard/pass?upgraded=pending` |
| 主站升級補差價 | `/api/upgrade` | **主站** | 同上 | `/dashboard/settings?upgraded=proration` |
| NovaStore | 產品站 CTA → hub `/dashboard/pass#upgrade` | **主站**（子站不直打綠界） | 同上 | Pass |
| DocMate AI | 產品站 → hub Pass／`catalog=ai_doc` | **主站** | 同上 → 更新 docmate_profiles | `/dashboard/ai-doc?upgraded=pending` |
| 拓維空間 | 產品站 → hub Pass `DimensionCheckout` | **主站** `dim:*` | 同上 → `POST novadimension/api/credits/fulfill` | `novadimension/?paid=1`（僅 UI，不加點） |
| 訂閱管家 | 無付費 | — | — | — |
| 拓脈預約訂閱 | 拓脈 `/api/checkout` 等 | **拓脈本站** | `https://taiwanbiz.vercel.app/api/webhooks/ecpay` | welcome／stores 結果頁 |
| 拓脈訂金／賣場 | booking deposit／shop checkout | **拓脈本站** | 同上 | storefront `?deposit=1`／`?paid=1` |

## 環境變數（已同步）

- 主站 `novaos`：`ECPAY_MERCHANT_ID`／`ECPAY_HASH_KEY`／`ECPAY_HASH_IV`／`ECPAY_STAGE=false`／`ECPAY_CHOOSE_PAYMENT=ALL`
- 拓脈 `taiwanbiz`：同上三金鑰 + `ECPAY_FORCE_MOCK=false`
- 已 `vercel deploy --prod` 主站與拓脈

## 建議下一步（綠界後台）

1. 登入廠商專區 → 系統介接設定 → **全方位金流**（非物流、非發票）
2. 確認商店代號為 `3284622`，重新複製 HashKey／HashIV
3. 確認金流收款／信用卡等服務已開通
4. 回傳新 Hash 後再探針；成功後即可真實訂閱結帳
