-- v6 Main-site pull API support
-- Adds API client metadata, sync cursors, access logs, and public-safe views for the main website.

CREATE TABLE IF NOT EXISTS api_clients (
  id VARCHAR(120) PRIMARY KEY,
  client_key VARCHAR(120) NOT NULL UNIQUE,
  name_zh VARCHAR(160) NOT NULL,
  client_type ENUM('main_site','worker','admin_tool','external_partner') NOT NULL DEFAULT 'main_site',
  allowed_scopes_json JSON NOT NULL,
  allowed_origins_json JSON NULL,
  status ENUM('active','paused','revoked') NOT NULL DEFAULT 'active',
  last_used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_api_clients_status (status)
);

CREATE TABLE IF NOT EXISTS knowledge_sync_cursors (
  id VARCHAR(120) PRIMARY KEY,
  client_key VARCHAR(120) NOT NULL,
  sync_key VARCHAR(120) NOT NULL,
  last_cursor VARCHAR(255) NULL,
  last_synced_at DATETIME NULL,
  entity_counts_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sync_cursor (client_key, sync_key)
);

CREATE TABLE IF NOT EXISTS knowledge_api_access_logs (
  id VARCHAR(120) PRIMARY KEY,
  client_key VARCHAR(120) NULL,
  route VARCHAR(255) NOT NULL,
  method VARCHAR(20) NOT NULL,
  status_code INT NOT NULL,
  cache_status ENUM('hit','miss','bypass','unknown') NOT NULL DEFAULT 'unknown',
  duration_ms INT NULL,
  ip_address VARCHAR(80) NULL,
  user_agent TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_access_route_created (route, created_at),
  INDEX idx_access_client_created (client_key, created_at)
);

CREATE OR REPLACE VIEW vw_main_site_bootstrap_facts AS
SELECT id, category, statement_zh, statement_en, visibility, source_ids_json, evidence_hint, tags_json, updated_at
FROM kb_facts
WHERE verification_status = 'verified_public'
  AND sensitivity IN ('low','medium')
  AND visibility IN ('public','public_summary_only');

CREATE OR REPLACE VIEW vw_main_site_search_documents AS
SELECT id, entity_type, entity_id, title_zh, body_zh, keywords_json, weight, source_ids_json, updated_at
FROM kb_search_documents
WHERE visibility = 'public';

CREATE OR REPLACE VIEW vw_main_site_related_edges AS
SELECT id, subject_type, subject_id, predicate, object_type, object_id, visibility, source_ids_json, created_at
FROM kb_entity_relations
WHERE visibility IN ('public','summary_only');

CREATE OR REPLACE VIEW vw_main_site_vocabulary_audio AS
SELECT e.id, e.corpus_scope, e.entry_type, e.dialect_code, e.dialect_name, e.dialect_zh, e.community_key, e.category_key,
       e.puyuma_form, e.zh_tw, e.en, e.source_phon, e.ipa_value, e.ipa_status,
       e.source_id, e.source_path, e.source_row, e.source_format,
       a.remote_url AS audio_url, a.mime_type, a.storage_mode, a.duration_seconds
FROM puyuma_corpus_entries e
JOIN puyuma_audio_assets a ON a.corpus_entry_id = e.id
WHERE e.review_status = 'approved_for_public_learning'
  AND e.sensitivity = 'public'
  AND a.playback_enabled = TRUE;

CREATE INDEX idx_kb_facts_updated_public ON kb_facts(updated_at, verification_status, visibility);
CREATE INDEX idx_corpus_updated_public ON puyuma_corpus_entries(updated_at, review_status, sensitivity);
