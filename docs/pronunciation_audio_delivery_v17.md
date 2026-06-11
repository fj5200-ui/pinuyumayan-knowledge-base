# v17 真人音檔發音交付層

v17 將「像音檔那樣的發音」落到主站可用的播放流程，而不是用未審核的假 TTS 替代。

## 原則

1. 有 FormosanBank/ePark 真人來源音檔時，公開端直接播放真人音檔。
2. 若主站因 CORS、穩定性或快取需求無法直接播放，使用 `/api/public/audio/proxy/{assetId}`。
3. proxy 只允許 manifest 內白名單來源，不接受任意 URL，避免變成開放代理。
4. 沒有真人音檔時，不公開合成 TTS；只建立後台候選與審核任務。
5. 若未來要做神經 TTS，必須先有授權語料、文本音檔對齊、方言標籤、族語教師/族人審核與品質門檻。

## 主站端點

```txt
GET /api/public/audio/manifest
GET /api/public/audio/search?q=...&dialectCode=...
GET /api/public/audio/head/:assetId
GET /api/public/audio/proxy/:assetId
GET /api/public/pronunciation/search?q=...
GET /api/public/pronunciation/player-config
```

## 主站播放建議

1. 優先使用 `sourceAudioUrl`。
2. 若前端播放失敗，切換 `proxyUrl`。
3. UI 必須標示「真人來源音檔」，不要把它寫成 AI 合成 TTS。
4. `requiresNativeReviewForTeaching = true` 時，可公開播放，但正式教材頁要顯示「教學審核中」。

## 部署注意

若使用 Cloudflare：

- `/api/public/audio/manifest` 可 cache 1 天。
- `/api/public/audio/head/*` 可 cache 1 小時。
- `/api/public/audio/proxy/*` 可 cache 1 小時 + stale while revalidate。
- 不要將 internal/admin route 放進 public cache。
