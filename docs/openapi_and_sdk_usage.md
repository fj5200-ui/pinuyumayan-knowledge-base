# OpenAPI 與主站 SDK 使用說明 v9

本專案現在提供 OpenAPI 規格，主站可以用 REST、tRPC 或 SDK 方式拉取知識。

## OpenAPI 位置

```txt
openapi/pinuyumayan-main-site-api.openapi.json
GET /api/ops/openapi.json
GET /api/ops/openapi
```

## 主站前台建議

前台/SSR 優先使用 public API：

```txt
GET /api/public/knowledge/bootstrap
GET /api/public/knowledge/search?q=...
GET /api/public/knowledge/related?entityType=...&entityId=...
GET /api/public/knowledge/communities/:communityKey
GET /api/public/knowledge/vocabulary?dialectCode=39&limit=50&cursor=...
```

## 主站後端同步

主站後端、ISR cache warmer 或 Cron job 使用 internal API：

```txt
GET /api/internal/main-site/knowledge/bundle
GET /api/internal/main-site/knowledge/delta?since=...
Header: x-pinuyumayan-main-site-key
```

## 重要安全規則

1. Public API 只能回傳 verified / approved / public-safe view。
2. Internal API 需要 API key，但仍只提供主站可用內容，不提供審核備註與 restricted 資料。
3. Webhook 只作通知，主站收到 webhook 後仍必須拉 delta 驗證。
4. 千筆語料不可在 API 啟動時匯入，必須用 post-deploy job 或 worker。
