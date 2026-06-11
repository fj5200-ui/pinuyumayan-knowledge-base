# v27 Production DB / Static fallback 政策

你的資料庫會放在 VPS，所以 production 應以 DB 為主。

```env
NODE_ENV=production
KNOWLEDGE_DATA_MODE=db
DISABLE_PRODUCTION_STATIC_FALLBACK=true
```

規則：

1. development 可以使用 static fallback。
2. staging 可以 fallback，但要記錄 warning。
3. production 若 DB-backed route 連不到 DB，不可默默回舊 JSON，必須回錯誤並記錄 `db_fallback_events_v27`。

這避免正式主站資料庫壞掉時，前台仍吃舊資料而無人發現。
