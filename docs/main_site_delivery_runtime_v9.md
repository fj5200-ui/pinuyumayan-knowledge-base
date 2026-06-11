# 主站知識拉取營運層 v9

v9 補強的是「主站穩定拉資料」能力，不是單純增加資料。

## 新增能力

- OpenAPI JSON
- Public API cache header
- Internal bundle / delta sync
- API key 內部同步
- Rate limit middleware
- Webhook outbox 資料表
- Search reindex queue
- Corpus import file manifest / checkpoints
- CI/CD 驗收流程
- 主站拉取 smoke check

## 建議架構

```txt
主站 Next.js / Cloudflare Pages
  ↓ public REST / internal sync API
Pinuyumayan Backend Database API
  ↓ public-safe SQL views / Drizzle services
MySQL or TiDB Cloud
  ↓ post-deploy worker
FormosanBank/ePark full corpus import
```

## 千筆語料部署策略

1. 部署 API。
2. 匯入 preview subset，確認主站可以拉資料。
3. 背景執行 full corpus import。
4. 匯入完成後重建 search index。
5. 寫入 webhook_outbox_events 或更新 sync cursor。
6. 主站拉 delta，重新驗證與快取。

## 不要做的事

- 不要在 `npm start` 中下載千筆語料。
- 不要把 blocked-license 音檔暴露到 public API。
- 不要讓主站直接連資料庫。
- 不要把 high sensitivity 內容當公開教學內容。
