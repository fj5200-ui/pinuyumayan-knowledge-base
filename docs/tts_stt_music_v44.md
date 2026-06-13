# v44 TTS/STT + Music DB Upgrade

## 完成範圍

1. `data/audio/speech_asset_authorization_v44.json` 逐筆列出 80 筆 preview speech assets 的 license、speaker consent、alignment 欄位。未取得證據前一律 `blocked_until_license_consent_alignment`，不會誤標為可訓練。
2. `/api/public/search/music/v43` 改為 MySQL FULLTEXT 優先查詢 `music_search_documents_v43`。沒有 `DATABASE_URL` 或 VPS 尚未匯入資料時，才回到 JSON preview fallback。
3. `scripts/export_tts_stt_dataset_v44.py` 產生 train/dev/test/blocked JSONL 與 model card。預設不下載音檔、不輸出 YouTube/audio binary。
4. `scripts/authority_source_candidate_worker_v44.py` 產生臺灣音樂館、國家文化記憶庫、金曲獎 metadata 候選，寫入 candidate seed/report，不自動公開。
5. 後台新增 `MusicSpeechReviewCenterV44` contract UI。
6. 主站新增 `/music/search`、`/music/[id]`、`/tts-stt` 頁面範本。

## VPS 使用

```bash
cd pinuyumayan-backend-database
./deploy/vps-tts-stt-v44.sh
IMPORT_SQL=1 DATABASE_URL="$DATABASE_URL" ./deploy/vps-tts-stt-v44.sh
```

## 重要限制

- v44 不會把 preview assets 直接放入訓練集。
- 缺 license、speaker consent、alignment 任一項，就只會輸出到 `blocked_candidates.jsonl`。
- 權威來源 worker 只收 metadata candidate，不下載音訊、影片、完整歌詞或敏感祭儀細節。
