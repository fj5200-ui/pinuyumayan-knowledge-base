# v24 主站 Runtime Bridge 對接指南

v24 的目標是讓主站可以直接搬用 AI Composer、HMAC internal client、連線檢查與後台審核工作台範例。

## 主站要設定

```env
NEXT_PUBLIC_KB_API_URL=https://kb.pinuyumayan.tw
PINUYUMAYAN_KB_API_URL=https://kb.pinuyumayan.tw
PINUYUMAYAN_MAIN_SITE_CLIENT_ID=main-site-production
PINUYUMAYAN_MAIN_SITE_API_KEY=請放 secret
PINUYUMAYAN_HMAC_SECRET=請放 secret
PINUYUMAYAN_HMAC_ENABLED=true
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxx
NEXT_PUBLIC_SITE_URL=https://pinuyumayan.tw
```

## 主站要搬的檔案

```txt
webapp/lib/kbHmacClient.v24.ts → src/lib/kbHmacClient.ts
webapp/app/api/ai/compose-v24/route.ts → app/api/ai/compose/route.ts
webapp/app/api/kb/connection-check/route.ts → app/api/kb/connection-check/route.ts
webapp/components/ArticleComposerV24.tsx → components/articles/ArticleComposer.tsx
webapp/components/AdminArticleReviewWorkbenchV24.tsx → components/admin/AdminArticleReviewWorkbench.tsx
```

## 分工

文章正文由主站 server route 調用 OpenAI/Kimi。後端知識庫只提供史料包與治理：引用、去重、敏感、授權、卑南遺址禁止關聯與審核。

## 不可做

- 不可把 AI key 放進瀏覽器。
- 不可讓後端知識庫直接生成文章正文。
- 不可將卑南文化遺址 / Beinan Site 當成卑南族文化來源。
- 不可將使用者想法改寫成史實。
