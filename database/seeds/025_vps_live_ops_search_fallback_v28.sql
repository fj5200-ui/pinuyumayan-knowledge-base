-- 025_vps_live_ops_search_fallback_v28.sql
-- Seed minimal v28 dashboard events and policy candidates. No public claims are created here.

INSERT INTO admin_live_dashboard_events_v28 (panel_key, severity, title, detail_json)
VALUES
('corpus_acceptance', 'warning', 'Embedded preview corpus is below full-corpus threshold', JSON_OBJECT('embedded_entries', 80, 'required_min_entries', 1000)),
('production_fallback', 'info', 'Production static fallback policy loaded', JSON_OBJECT('disable_production_static_fallback', true)),
('forbidden_relation', 'info', 'Beinan/Peinan archaeological relation blocklist active', JSON_OBJECT('blocked_terms', JSON_ARRAY('卑南文化遺址','卑南遺址','Beinan Site','Peinan Site')))
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO source_candidate_review_items_v28 (candidate_key, adapter_key, source_title, source_url, publisher, license_status, claim_text, forbidden_relation_hit, review_status)
VALUES
('v28-policy-no-beinan-archaeology', 'system_policy', 'Forbidden relation policy', NULL, 'Pinuyumayan KB policy', 'internal_policy', '卑南文化遺址與卑南族文化知識來源不得自動關聯。', false, 'approved'),
('v28-policy-full-corpus-staging', 'system_policy', 'Full corpus staging policy', NULL, 'Pinuyumayan KB policy', 'internal_policy', '千筆語料必須先在 VPS staging 產出驗收報告，再推進公開 release。', false, 'approved')
ON DUPLICATE KEY UPDATE review_status = VALUES(review_status);
