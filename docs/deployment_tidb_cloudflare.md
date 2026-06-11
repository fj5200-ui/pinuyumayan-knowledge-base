# 部署建議：Cloudflare + TiDB/MySQL

## 建議部署

- Frontend：Cloudflare Pages
- API：Cloudflare Workers 或 VPS Node.js Express
- DB：TiDB Cloud Starter / Aiven MySQL / VPS MySQL
- Object storage：Cloudflare R2，用於音檔鏡像；預設不啟用

## 環境變數

```env
DATABASE_URL=mysql://user:password@host:4000/pinuyumayan
AUDIO_MIRROR_ENABLED=false
TTS_PUBLIC_UI_ENABLED=false
FULL_CORPUS_MIN_ENTRIES=1000
```

## Release blocker

- 未跑 `validate_backend_database_project.py` 不可部署。
- full corpus 未達 1000 筆不可標為 complete。
- 音檔授權未審核不可鏡像到 R2/CDN。
- public views 不可暴露 `admin_only` 或 `restricted` 資料。
