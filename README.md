# 拓新雲端 NovaOS

專業雲端工具與軟體解決方案開發商品牌主站。

- **正式網址：** https://paycheck.com.de  
- **套件名稱：** `novaos`  
- **產品矩陣：** NovaStore、拓脈預約、訂閱管家、拓維空間

## 與子站的關係（不衝突）

| 專案 | 職責 |
|------|------|
| **本專案（拓新雲端）** | 品牌主站、導流、定價／金流統一入口、ecosystem 編排 |
| **novastore** | 賣場對帳產品（獨立 repo／Vercel） |
| 拓脈／訂閱管家／拓維 | 獨立站；網址見 `ecosystem/sites.json`（部分尚未接 Git） |

子站原始碼**不併入**本 repo。需要一次改多站時：

```bash
npm run ecosystem:sync
# 編輯 /agent/ecosystem-sites/<id>/ …
# 在該子目錄 git commit && git push（推到子站自己的 remote）
```

詳見 [`ecosystem/README.md`](./ecosystem/README.md) 與 [`AGENTS.md`](./AGENTS.md)。

## 技術棧

- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase Auth / Postgres
- 綠界 ECPay（訂閱升級統一入口）
- Playwright 全站稽核（`npm run audit:sites`）

## 開發

```bash
cp .env.example .env.local
npm install
npm run playwright:install   # 首次稽核用
npm run dev
```

## 常用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 本機主站 |
| `npm run audit:sites` | 五站桌面／手機稽核＋截圖 |
| `npm run ecosystem:sync` | 拉齊子站 checkout 到 `ecosystem/sites/` |

## 部署

Vercel 專案目前連線名稱可能仍為 `paycheck-tw`；正式網域固定為 **paycheck.com.de**。
