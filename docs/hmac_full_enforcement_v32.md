# v32 HMAC internal API 全面攔截

v32 在 `server.ts` 對 `/api/internal/*` 掛上 `enforceInternalHmacV32()`。正式環境建議：

```env
PINUYUMAYAN_HMAC_ENABLED=true
HMAC_REPORT_ONLY=false
```

過渡期可用 `HMAC_REPORT_ONLY=true` 先觀察，但 production cutover 前要關閉 report-only。
