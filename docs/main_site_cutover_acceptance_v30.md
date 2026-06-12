# v30 主站切換驗收

主站需要先確認：

```env
NEXT_PUBLIC_KB_API_URL=https://kb.pinuyumayan.tw
PINUYUMAYAN_KB_API_URL=https://kb.pinuyumayan.tw
PINUYUMAYAN_MAIN_SITE_CLIENT_ID=main-site-production
PINUYUMAYAN_MAIN_SITE_API_KEY=...
PINUYUMAYAN_HMAC_SECRET=...
AI_PROVIDER=openai 或 kimi
```

AI key 不可進瀏覽器，只能放主站 server route。

## 主站驗收 API

```txt
GET /api/ops/main-site/v30/acceptance
POST /api/internal/main-site/v30/acceptance-report
```

驗收重點：public API 可讀、internal API 無 HMAC 必須拒絕、有 HMAC 才能通過、AI 草稿必須走後端引用/去重/禁止關聯/敏感檢查。
