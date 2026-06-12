# v41 完成 v40 下一步 1–6 項

1. YouTube Data API worker：`scripts/youtube_metadata_worker_v41.py`，metadata-only，不下載音訊/影片。
2. 音樂審核 UI：`webapp/components/MusicTtsSttOpsDashboardV41.tsx` 與 `data/admin/music_review_ui_v41.json`。
3. 權威來源 adapter：`data/integration/authority_music_source_adapters_v41.json`。
4. MySQL FULLTEXT 音樂索引：`scripts/build_music_fulltext_seed_v41.py` 與 `music_search_index_documents_v41`。
5. AI Composer 音樂防護：`data/security/ai_music_guardrails_v41.json` 與 `/api/internal/ai-article/v41/music-grounding-check`。
6. VPS DB transaction contract：`data/database/vps_music_transaction_contract_v41.json` 與 v41 internal report endpoints。

注意：真正抓 YouTube metadata 需要在 VPS 設定 `YOUTUBE_API_KEY` 後執行；預設模式只產生 preview metadata，不會偽造實抓結果。
