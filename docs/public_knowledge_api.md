# Public Knowledge API v6

## GET `/api/public/knowledge/bootstrap`

回傳首頁與全站導覽需要的公開知識。

Response:

```json
{
  "meta": { "version": "0.6.0", "visibility": "public" },
  "communities": [],
  "facts": [],
  "rituals": [],
  "vocabularyStats": []
}
```

## GET `/api/public/knowledge/search?q=卑南族`

回傳公開搜尋文件。

## GET `/api/public/knowledge/related?entityType=community&entityId=puyuma`

回傳相關邊與公開搜尋文件。

## GET `/api/public/knowledge/communities/:communityKey`

回傳單一十社頁資料與相關 facts。

## GET `/api/public/knowledge/vocabulary?dialectCode=38&limit=20`

回傳語詞/句型、音檔 URL、IPA/source PHON。

## GET `/api/internal/main-site/knowledge/bundle`

主站後端批次同步使用。需要：

```http
x-pinuyumayan-main-site-key: <secret>
```

## GET `/api/internal/main-site/knowledge/delta?since=2026-06-11T00:00:00Z`

主站後端增量同步使用。
