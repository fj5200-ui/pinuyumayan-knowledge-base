# Music Search Observability v46

v46 建立 `/api/internal/search/music/v46/query-log`，讓 production search route 可以把查詢、結果數、延遲、facet、zero-result suggestions 寫入 MySQL。

## 指標

- query_count_24h
- zero_result_count_24h
- zero_result_rate
- p95_latency_ms
- p99_latency_ms
- top_facets

## 資料表

- `music_search_query_logs_v46`
- `music_search_zero_result_events_v46`
- `music_search_facet_daily_stats_v46`
- `music_search_latency_snapshots_v46`

## 隱私

只保存 ip hash，不保存原始 IP；query retention 預設 180 天。
