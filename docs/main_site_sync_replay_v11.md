# Main Site Sync Replay v11

主站可能因部署、網路、ISR/CDN 快取或 webhook 失敗而錯過部分知識更新。v11 新增 sync replay，用來補回指定時間區間的 public-safe event。

## Endpoint

```http
POST /api/internal/main-site/sync/replay
x-pinuyumayan-main-site-key: <key>
content-type: application/json

{
  "since": "2026-06-01T00:00:00+08:00",
  "until": "2026-06-11T00:00:00+08:00"
}
```

## 限制

- 最大回放區間：30 天。
- 只回放 public-safe events。
- 需要 `knowledge:read` 與 `sync:replay` scope。
- 回放結果應可重試、可去重、可追蹤 request id。
