# 主站拉取卑南族知識整合指南 v6

本專案現在定位為「卑南族文化綜合平台後端資料庫服務」。主站不應直接讀 JSON 檔，也不應直接連資料庫；主站應透過公開 API 或 internal API 拉取已審核資料。

## 1. 建議架構

```txt
主站 Frontend / SSR
    ↓ public API / internal API
Pinuyumayan Backend Database API
    ↓ public-safe views
MySQL / TiDB 知識資料庫
```

## 2. 主站使用方式

首頁：

```ts
const res = await fetch(`${KB_API}/api/public/knowledge/bootstrap`, {
  next: { revalidate: 300 }
});
```

文章頁或十社頁的相關知識：

```ts
const params = new URLSearchParams({ entityType: 'community', entityId: 'puyuma' });
const res = await fetch(`${KB_API}/api/public/knowledge/related?${params}`, {
  next: { revalidate: 300 }
});
```

語詞與音檔：

```ts
const res = await fetch(`${KB_API}/api/public/knowledge/vocabulary?dialectCode=38&limit=50`, {
  next: { revalidate: 300 }
});
```

主站後端批次同步：

```ts
const res = await fetch(`${KB_API}/api/internal/main-site/knowledge/bundle?includeVocabulary=true`, {
  headers: { 'x-pinuyumayan-main-site-key': process.env.PINUYUMAYAN_MAIN_SITE_API_KEY! },
  cache: 'no-store'
});
```

## 3. 安全規則

- 公開 API 只回傳 `verified_public`、`approved`、`public_summary_only`、`approved_for_public_learning`。
- `admin_only`、`restricted`、`rejected`、`archived` 永不回傳給主站。
- internal API 必須使用 `x-pinuyumayan-main-site-key`。
- 祭儀、祖靈、巫師、禁忌、家族內部知識仍只能公開摘要。

## 4. 快取策略

| 用途 | API | 建議快取 |
|---|---|---|
| 首頁/全站初始資料 | `/api/public/knowledge/bootstrap` | 5 分鐘 + stale |
| 搜尋 | `/api/public/knowledge/search` | 2 分鐘 |
| 相關知識 | `/api/public/knowledge/related` | 5 分鐘 |
| 十社頁 | `/api/public/knowledge/communities/:key` | 10 分鐘 |
| 語詞音檔 | `/api/public/knowledge/vocabulary` | 5 分鐘 |
| 批次同步 | `/api/internal/main-site/knowledge/bundle` | 不快取 |
| 增量同步 | `/api/internal/main-site/knowledge/delta` | 不快取 |

## 5. 主站頁面對應

| 主站頁面 | 建議 API |
|---|---|
| `/` | bootstrap |
| `/communities` | bootstrap.communities |
| `/communities/[key]` | community + related |
| `/knowledge/[slug]` | search/related |
| `/language/puyuma` | vocabulary |
| `/search` | search |
```
