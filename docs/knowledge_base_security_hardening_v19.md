# v19 後端知識庫安全強化

## 安全目標

v19 將知識庫定位為「可信來源與審核服務」，不是自由生成內容的 AI 後端。

## 新增控制

- Public API 只回傳 public / public_summary_only / verified claims。
- Internal API 必須帶 API key，建議再加 HMAC signature。
- source packet resolve 會記錄 client_id、packet_id、claim_count。
- draft validation 只保存 hash/fingerprint，避免保存敏感 prompt 原文。
- 對祭儀、祖靈、巫術、禁忌等內容採用 public_summary_only 或 restricted。
- 所有 publish 前必須通過 duplicate / citation / sensitivity / license 檢查。

## 新增資料表

```txt
kb_access_policies_v19
kb_row_security_rules_v19
source_claim_read_scopes_v19
frontend_ai_source_packet_events_v19
frontend_ai_draft_submissions_v19
ai_article_validation_findings_v19
api_signature_nonces_v19
knowledge_vault_audit_logs_v19
content_security_findings_v19
true_source_ingestion_runs_v19
```
