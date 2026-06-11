# 卑南族文化綜合平台｜後台營運指南 v4

本指南補強資料庫營運層，不新增文化事實。所有公開內容仍以 `verified_pinuyumayan_facts.json`、FormosanBank/ePark 來源與已審核資料為準。

## 後台主要工作台

1. **知識審核工作台**：處理中高敏感 facts、族語 G2P/IPA、TTS、授權審查。
2. **語料匯入監控**：追蹤 FormosanBank/ePark CSV/XML 來源探索、下載、解析、去重、驗收、匯入。
3. **音檔資產管理**：預設播放來源 URL；鏡像到 R2/S3/CDN 前必須先通過授權審核。
4. **搜尋索引管理**：重建公開搜尋文件，不索引 high sensitivity 未審核內容。
5. **來源與授權管理**：維護來源 ID、授權狀態、引用文字與可公開層級。

## 重要規則

- `preview_subset` 與 `full_corpus` 必須在 UI 分開顯示。
- TTS 預設不得公開啟用；只能作為後台輔助或審核後無障礙 fallback。
- 高敏感內容不可直接生成流程、禁忌、仿作、日期推測或完整教學。
- 音檔 URL 可用於學習頁預覽，但商用與鏡像需授權審查。

## 建議後台路由

```txt
/admin/knowledge
/admin/reviews
/admin/imports
/admin/audio-assets
/admin/sources
/admin/search-index
/admin/release-checks
```

