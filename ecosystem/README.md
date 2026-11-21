# 拓新雲端子網站工作區（Ecosystem）

此目錄讓 **拓新雲端主專案** 能一次檢視／修改各子站，同時保持每個子站是**獨立 Git 專案**，之後在各自 repo 修改不會與主站互相覆蓋。

## 原則（避免衝突）

| 層級 | 誰擁有原始碼 | 怎麼改 |
|------|-------------|--------|
| 主站 拓新雲端 | 本 repo（`novaos`） | 直接改本專案 |
| 子站（NovaStore／DocMate…） | **各自獨立 repo** | 優先在該專案改；或在本專案 `ecosystem/sites/<id>` checkout 改完後 **push 回該 repo** |
| 產品網址／矩陣文案 | 本 repo `ecosystem/sites.json` + `src/lib/product-ecosystem.ts` | 只改主站即可更新導流與稽核清單 |

子站 checkout 放在 **主站目錄外**（預設 `/agent/ecosystem-sites/`），因此：

- 不會進主站 git（也不會被 Next／tsc 掃到）
- 每個資料夾有自己的 `.git`，push 回各自 remote，與主站零衝突

## 一次拉齊所有子站

```bash
npm run ecosystem:sync
```

會把 `sites.json` 裡有 `repo` 或本機 `localFallback` 的專案放到：

```
/agent/ecosystem-sites/novastore
/agent/ecosystem-sites/docmate
…
```

（可用環境變數 `NOVAOS_ECOSYSTEM_SITES_DIR` 覆寫路徑。）

## 建議工作流

**A. 一次改多站（用主站環境）**

1. `npm run ecosystem:sync`
2. 在 `/agent/ecosystem-sites/<id>` 改程式
3. 於該目錄 `git commit` + `git push`（推到**子站自己的 remote**）
4. 若只改導流網址／產品矩陣：改 `ecosystem/sites.json` 與 `src/lib/product-ecosystem.ts`

**B. 只改單一站（用該站專案）**

1. 開啟該站獨立 Cursor 專案／repo（例如 `novastore`）
2. 正常開發、部署
3. 不必動主站；主站下次 `ecosystem:sync` 會拉到最新

## 新增子站

1. 在 `sites.json` 的 `sites` 陣列加一筆（`id` / `url` / `repo`）
2. 更新 `src/lib/product-ecosystem.ts` 產品卡
3. （稽核清單會自動讀 `sites.json`）
4. `npm run ecosystem:sync`
