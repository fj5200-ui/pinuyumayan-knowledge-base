-- Pinuyumayan Knowledge Database v4: operational views and indexes
-- MySQL 8 / TiDB compatible where possible.

CREATE INDEX idx_kb_facts_status_sensitivity ON kb_facts (verification_status, sensitivity);
CREATE INDEX idx_kb_facts_source ON kb_facts (primary_source_id);
CREATE INDEX idx_corpus_dialect_audio ON puyuma_corpus_entries (dialect_code, has_audio, review_status);
CREATE INDEX idx_audio_status ON puyuma_audio_assets (mirror_status, license_status);
CREATE INDEX idx_review_status_priority ON kb_review_tasks (status, priority, review_type);
CREATE INDEX idx_import_runs_status ON kb_import_runs (status, started_at);
CREATE INDEX idx_search_public_type ON kb_search_documents (is_public, document_type);

CREATE OR REPLACE VIEW v_public_kb_facts AS
SELECT id, category, statement_zh, sensitivity, verification_status, primary_source_id, updated_at
FROM kb_facts
WHERE verification_status = 'verified_public'
  AND sensitivity IN ('low', 'medium')
  AND public_status = 'approved';

CREATE OR REPLACE VIEW v_puyuma_public_audio_entries AS
SELECT e.id, e.dialect_code, e.dialect_name, e.puyuma_form, e.zh_tw, e.en,
       a.source_audio_url, a.local_audio_url, e.ipa_value, e.g2p_status, e.review_status
FROM puyuma_corpus_entries e
LEFT JOIN puyuma_audio_assets a ON a.corpus_entry_id = e.id
WHERE e.review_status IN ('approved_for_public_learning', 'ready_for_public_preview')
  AND e.has_audio = 1;

CREATE OR REPLACE VIEW v_pending_cultural_reviews AS
SELECT id, entity_type, entity_id, review_type, priority, status, created_at
FROM kb_review_tasks
WHERE status = 'pending'
  AND review_type IN ('cultural_sensitivity', 'license_g2p_ipa_tts')
ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END, created_at ASC;

