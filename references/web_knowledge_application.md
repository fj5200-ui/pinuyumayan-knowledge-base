# 網站知識庫應用規範（含真實來源）

版本：2026-06-11

本文件說明「卑南族文化綜合平台」如何把知識庫轉成網站可用資料層。

## 核心原則

1. 所有公開內容必須有 `source_ids`。
2. 卑南族整體稱「卑南族／Pinuyumayan」；`Puyuma` 不直接代稱整個族群。
3. 前台正式分類使用「卑南族十社」；「八社」只作歷史用語。
4. 祭儀、祖靈、巫師、家族、會所訓練等高敏感內容，只能公開摘要。
5. 音檔 URL 只能來自已驗證 manifest 或 FormosanBank/ePark CSV/XML，不得用規則推測。

## 新增網站資料層

- `data/web/pinuyumayan_faq.json`：網站 FAQ 與 AI 回答草稿。
- `data/web/pinuyumayan_learning_paths.json`：學習路徑與單元。
- `data/web/pinuyumayan_timeline_events.json`：歷史與現代發展時間線。
- `data/web/pinuyumayan_topic_pages.json`：主題頁內容骨架。
- `data/web/pinuyumayan_content_blueprints.json`：前台頁面模組規劃。
- `data/web/pinuyumayan_seo_metadata.json`：SEO title、description、keywords。
- `data/web/pinuyumayan_source_citation_map.json`：來源與行號提示。
- `data/web/pinuyumayan_sensitive_content_rules.json`：敏感內容與 CMS 阻擋規則。
- `data/web/pinuyumayan_knowledge_api_contract.json`：網站 API 契約。
- `data/web/pinuyumayan_search_index.json`：跨 fact、FAQ、topic、timeline、語音卡搜尋索引。

## CMS 發布最低檢查

發布前必須確認：

- 是否有 `source_ids`。
- 是否使用正確族稱。
- 是否把「八社」誤作正式分類。
- 是否涉及祭儀流程、禁忌、家族、巫師、祖靈屋、歌詞、影像或音檔授權。
- `sensitivity=high` 是否經人工或部落/族人複核。
- 音檔 URL 是否存在於 `data/web/puyuma_vocabulary_audio_entries.json` 或 `data/generated/puyuma_audio_seed.json`。

## API 使用建議

網站後端可依 `data/web/pinuyumayan_knowledge_api_contract.json` 實作：

- `/api/knowledge/facts`
- `/api/knowledge/topics`
- `/api/knowledge/faq`
- `/api/knowledge/timeline`
- `/api/knowledge/learning-paths`
- `/api/knowledge/search`
- `/api/knowledge/sources`
- `/api/knowledge/safety-rules`

## 重要限制

本包提供「公開來源摘要」與「網站資料結構」，不是部落內部知識、儀式手冊、巫師知識、家族譜系或祭儀操作指南。
