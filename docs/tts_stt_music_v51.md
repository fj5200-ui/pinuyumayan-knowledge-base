# 卑南族文化綜合平台 TTS/STT + Music v51

v51 將 v50 的正式上線合約推進到封板操作層：VPS cutover seal、實物 evidence upload、搜尋 A/B 實測、權威 metadata 上架、模型治理 PDF renderer、Lighthouse/CWV 品牌效能驗收。

## 安全邊界

- 不公開音訊、不公開完整歌詞。
- 80 筆 preview speech assets 在完成 license、speaker consent、alignment、native speaker review 前仍全部 blocked。
- 所有 `/api/internal/*/v51/*` 路徑仍需 HMAC middleware。
- v51 支援 MySQL transaction；無 `DATABASE_URL` 時保留 contract-only 回應，避免本地驗收失敗。

## 上線條件

1. `production_cutover_seal_reports_v51` 六項封板證據全部通過。
2. `audit_evidence_uploads_v51` 完成實物上傳與掃描。
3. 搜尋 A/B 測試達 guardrail。
4. 權威 metadata rights approval 完成，且僅 metadata-only 發布。
5. 模型治理 PDF renderer 在 VPS 實機輸出水印 PDF。
6. 品牌頁面 Lighthouse / CWV / 截圖驗收完成。
