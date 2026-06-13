# TTS/STT + Music v46

v46 將 v45 的 production contract 推進到可上線治理層，重點是 reviewer queue、MySQL transaction 實寫、搜尋觀測、權威來源採集治理、模型實驗 registry，以及主站搜尋體驗。

## 完成範圍

- 80 筆 speech assets 進入 reviewer queue，支援指派、SLA、證據附件、退回原因模板與 RBAC。
- 內部寫入 API 支援 MySQL transaction：`beginTransaction` / `commit` / `rollback`。
- 搜尋觀測新增 query log、zero-result event、facet daily stats、latency snapshot contract。
- 權威來源 worker 新增 robots/ToS 記錄、ETag、If-Modified-Since、retry queue 與 candidate merge request。
- 模型實驗 registry 新增 dataset lineage、WER/CER/MOS gate、model card reviewer signoff 與不可發布原因。
- 主站 `/music/search` 更新 facets UI、推薦查詢、空結果引導與日間模式對比修正。

## 安全預設

- 所有 internal write action 仍由 HMAC middleware 保護。
- bulk approve 仍禁止。
- public TTS/STT release 仍關閉。
- 未授權音訊、完整歌詞、音訊下載仍禁止。
