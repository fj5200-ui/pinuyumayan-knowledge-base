# 主站環境變數設定 v23

## Cloudflare Pages / Next.js

在 Cloudflare Pages 的 Production variables 設定：

```txt
NEXT_PUBLIC_KB_API_URL
PINUYUMAYAN_KB_API_URL
PINUYUMAYAN_MAIN_SITE_CLIENT_ID
PINUYUMAYAN_MAIN_SITE_API_KEY
PINUYUMAYAN_HMAC_SECRET
PINUYUMAYAN_HMAC_ENABLED
AI_PROVIDER
OPENAI_API_KEY 或 KIMI_API_KEY
NEXT_PUBLIC_SITE_URL
```

`NEXT_PUBLIC_KB_API_URL` 可以公開，其餘 key 類必須使用 secret。

## 後端知識庫 CORS

```env
ALLOWED_ORIGINS=https://pinuyumayan.tw,https://www.pinuyumayan.tw,http://localhost:3000
MAIN_SITE_API_KEY=與主站 PINUYUMAYAN_MAIN_SITE_API_KEY 相同或透過 api_clients 表管理
PINUYUMAYAN_HMAC_SECRET=與主站相同
```

## 本機開發

```env
NEXT_PUBLIC_KB_API_URL=http://localhost:8787
PINUYUMAYAN_KB_API_URL=http://localhost:8787
PINUYUMAYAN_MAIN_SITE_CLIENT_ID=main-site-local
PINUYUMAYAN_MAIN_SITE_API_KEY=local-dev-key
PINUYUMAYAN_HMAC_SECRET=local-dev-hmac
PINUYUMAYAN_HMAC_ENABLED=false
AI_PROVIDER=mock
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
