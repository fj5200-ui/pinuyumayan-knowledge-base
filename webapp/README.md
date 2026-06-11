# 卑南語網站應用資料層（含音檔）

本資料夾提供「卑南族文化綜合平台」可直接使用的卑南語語音學習資料結構與前端/API 範例。

## 核心資料

- `data/web/puyuma_vocabulary_audio_entries.json`：網站可直接讀取的語句 + 音檔 URL。
- `data/web/puyuma_vocabulary_categories.json`：分類、方言篩選器。
- `data/web/puyuma_vocabulary_schema.json`：資料驗證 schema。
- `data/web/puyuma_vocabulary_seed.sql`：可匯入資料庫的 seed。

## 前端播放規則

音檔採遠端 URL 播放，ZIP 不內嵌 MP3 本體。前端應使用：

```tsx
<audio controls preload="none" src={entry.audio.url} />
```

不要一次預載全部音檔；列表頁只顯示播放按鈕，使用者點擊時再載入。

## 建議頁面

- `/language/puyuma`：卑南語學習首頁
- `/language/puyuma/vocabulary`：語詞／句型列表
- `/language/puyuma/audio/[id]`：單筆語音學習頁
- `/communities/[community]/language`：部落頁內的語言學習區

## 來源規則

資料來源為 FormosanBank/ePark 公開語料索引與 Klokah/ePark 公開音檔 URL。商業使用、大量下載、搬移到自有 CDN 前，需要另行確認授權與使用條件。
