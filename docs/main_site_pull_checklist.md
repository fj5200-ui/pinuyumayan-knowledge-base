# 主站拉取驗收清單 v6

- [ ] `.env` 已設定 `MAIN_SITE_API_KEY`。
- [ ] 主站後端已設定 `PINUYUMAYAN_KB_API_URL`。
- [ ] 主站後端已設定 `PINUYUMAYAN_MAIN_SITE_API_KEY`。
- [ ] 已執行 `database/migrations/0003_main_site_pull_api.sql`。
- [ ] 已執行 `database/seeds/007_main_site_api_client.sql`。
- [ ] `/api/public/knowledge/bootstrap` 只回傳 public-safe 資料。
- [ ] `/api/public/knowledge/vocabulary` 每筆音檔資料都有 `audio_url`。
- [ ] `/api/internal/main-site/knowledge/bundle` 沒有 API key 時回 401。
- [ ] 主站頁面使用 ISR/Cache，而不是每個使用者都直接打 DB。
- [ ] `admin_only` / `restricted` / `rejected` / `archived` 不會出現在主站 response。
