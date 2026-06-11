-- Public views and performance indexes for Pinuyumayan backend database v5

CREATE OR REPLACE VIEW vw_public_communities AS
SELECT community_key, sort_order, name_zh, romanization, origin_system, administrative_hint, platform_summary
FROM pinuyumayan_communities
WHERE review_status = 'approved';

CREATE OR REPLACE VIEW vw_public_facts AS
SELECT id, category, statement_zh, statement_en, sensitivity, visibility, source_ids_json, evidence_hint
FROM kb_facts
WHERE verification_status = 'verified_public'
  AND sensitivity IN ('low','medium')
  AND visibility IN ('public','public_summary_only');

CREATE OR REPLACE VIEW vw_public_ritual_summaries AS
SELECT id, name_zh, category, time_hint, summary, communities_json, platform_tags_json, visibility
FROM pinuyumayan_rituals
WHERE review_status = 'approved'
  AND visibility IN ('public','public_summary_only')
  AND sensitivity IN ('low','medium','high');

CREATE OR REPLACE VIEW vw_public_puyuma_audio_entries AS
SELECT e.id, e.dialect_code, e.dialect_name, e.dialect_zh, e.community_key, e.category_key,
       e.puyuma_form, e.zh_tw, e.en, e.source_phon, e.ipa_value, e.ipa_status,
       a.remote_url AS audio_url, a.mime_type, e.source_id, e.source_path, e.source_row
FROM puyuma_corpus_entries e
JOIN puyuma_audio_assets a ON a.corpus_entry_id = e.id
WHERE e.review_status = 'approved_for_public_learning'
  AND e.sensitivity = 'public'
  AND a.playback_enabled = TRUE;

CREATE OR REPLACE VIEW vw_admin_import_health AS
SELECT import_type,
       COUNT(*) AS run_count,
       SUM(status='completed') AS completed_count,
       SUM(status='failed') AS failed_count,
       MAX(finished_at) AS last_finished_at
FROM kb_import_runs
GROUP BY import_type;

CREATE OR REPLACE VIEW vw_open_review_tasks AS
SELECT id, entity_type, entity_id, task_type, priority, status, assigned_role, due_at, created_at
FROM kb_review_tasks
WHERE status IN ('open','in_progress')
ORDER BY FIELD(priority, 'p0','p1','p2','p3'), created_at ASC;

-- TiDB note: FULLTEXT support depends on deployment mode. If unavailable, use external search from kb_search_documents.
CREATE INDEX idx_puyuma_entries_dialect_review ON puyuma_corpus_entries(dialect_code, review_status);
CREATE INDEX idx_puyuma_entries_scope_review ON puyuma_corpus_entries(corpus_scope, review_status);
CREATE INDEX idx_audio_assets_entry_license ON puyuma_audio_assets(corpus_entry_id, license_review_status);
CREATE INDEX idx_review_tasks_status_role ON kb_review_tasks(status, assigned_role);
