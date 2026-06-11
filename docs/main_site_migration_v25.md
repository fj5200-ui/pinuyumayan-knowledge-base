# v25 主站搬移指南

## 必搬檔案

- `webapp/lib/kbHmacClient.v25.ts` → 主站 `src/lib/kbHmacClient.ts`
- `webapp/app/api/ai/compose-v25/route.ts` → 主站 `app/api/ai/compose/route.ts`

## 必設環境變數

```env
NEXT_PUBLIC_KB_API_URL=https://kb.pinuyumayan.tw
PINUYUMAYAN_KB_API_URL=https://kb.pinuyumayan.tw
PINUYUMAYAN_MAIN_SITE_CLIENT_ID=main-site-production
PINUYUMAYAN_MAIN_SITE_API_KEY=...
PINUYUMAYAN_HMAC_SECRET=...
PINUYUMAYAN_HMAC_ENABLED=true
AI_PROVIDER=openai
OPENAI_API_KEY=...
NEXT_PUBLIC_SITE_URL=https://pinuyumayan.tw
```

## 分工

文章正文由主站 server route 調用 AI provider 生成。後端知識庫只提供史料包、引用檢查、去重、卑南遺址禁止關聯檢查、敏感內容檢查、審核與發布治理。
