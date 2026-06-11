-- 卑南族文化綜合平台後端資料庫 v5
-- Target: MySQL 8 / TiDB Cloud
-- Safety: public views must filter review_status and sensitivity.

CREATE TABLE IF NOT EXISTS kb_sources (
  id VARCHAR(80) PRIMARY KEY,
  source_id VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  url TEXT NULL,
  publisher VARCHAR(255) NULL,
  source_type ENUM('official','academic','community','dataset','internal_review','unknown') NOT NULL DEFAULT 'unknown',
  license VARCHAR(160) NULL,
  trust_level ENUM('primary','high','medium','low','unknown') NOT NULL DEFAULT 'unknown',
  review_status ENUM('verified','needs_review','rejected','archived') NOT NULL DEFAULT 'needs_review',
  metadata_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_kb_sources_type (source_type),
  INDEX idx_kb_sources_review (review_status)
);

CREATE TABLE IF NOT EXISTS kb_facts (
  id VARCHAR(120) PRIMARY KEY,
  category VARCHAR(120) NOT NULL,
  statement_zh TEXT NOT NULL,
  statement_en TEXT NULL,
  sensitivity ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  verification_status ENUM('verified_public','needs_review','rejected','archived') NOT NULL DEFAULT 'needs_review',
  visibility ENUM('public','public_summary_only','admin_only','restricted') NOT NULL DEFAULT 'public_summary_only',
  source_ids_json JSON NOT NULL,
  evidence_hint TEXT NULL,
  tags_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_kb_facts_statement (statement_zh),
  INDEX idx_kb_facts_category (category),
  INDEX idx_kb_facts_sensitivity (sensitivity),
  INDEX idx_kb_facts_status (verification_status)
);

CREATE TABLE IF NOT EXISTS kb_source_claims (
  id VARCHAR(120) PRIMARY KEY,
  claim_key VARCHAR(120) NOT NULL,
  claim_text_zh TEXT NOT NULL,
  source_ids_json JSON NOT NULL,
  confidence ENUM('high','medium','low') NOT NULL DEFAULT 'medium',
  public_level ENUM('public','summary_only','restricted') NOT NULL DEFAULT 'summary_only',
  conflict_policy_key VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_claim_key (claim_key),
  INDEX idx_claim_public_level (public_level)
);

CREATE TABLE IF NOT EXISTS pinuyumayan_communities (
  id VARCHAR(80) PRIMARY KEY,
  community_key VARCHAR(80) NOT NULL UNIQUE,
  sort_order INT NOT NULL,
  name_zh VARCHAR(80) NOT NULL,
  romanization VARCHAR(120) NOT NULL,
  origin_system VARCHAR(80) NULL,
  administrative_hint VARCHAR(255) NULL,
  platform_summary TEXT NULL,
  content_focus_json JSON NULL,
  source_ids_json JSON NOT NULL,
  review_status ENUM('approved','needs_review','archived') NOT NULL DEFAULT 'needs_review',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_community_sort (sort_order),
  INDEX idx_community_origin (origin_system)
);

CREATE TABLE IF NOT EXISTS pinuyumayan_community_aliases (
  id VARCHAR(120) PRIMARY KEY,
  community_key VARCHAR(80) NOT NULL,
  alias_text VARCHAR(160) NOT NULL,
  alias_type ENUM('romanization','historical','administrative','common','deprecated','warning') NOT NULL DEFAULT 'common',
  usage_note TEXT NULL,
  allowed_for_public_search BOOLEAN NOT NULL DEFAULT TRUE,
  allowed_for_primary_display BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_alias (community_key, alias_text),
  INDEX idx_alias_text (alias_text),
  CONSTRAINT fk_alias_community FOREIGN KEY (community_key) REFERENCES pinuyumayan_communities(community_key)
);

CREATE TABLE IF NOT EXISTS pinuyumayan_rituals (
  id VARCHAR(100) PRIMARY KEY,
  name_zh VARCHAR(160) NOT NULL,
  category VARCHAR(120) NULL,
  time_hint VARCHAR(255) NULL,
  summary TEXT NOT NULL,
  communities_json JSON NULL,
  platform_tags_json JSON NULL,
  visibility ENUM('public','public_summary_only','admin_only','restricted') NOT NULL DEFAULT 'public_summary_only',
  sensitivity ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  source_ids_json JSON NOT NULL,
  review_status ENUM('approved','needs_review','rejected','archived') NOT NULL DEFAULT 'needs_review',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_rituals_summary (name_zh, summary),
  INDEX idx_ritual_visibility (visibility),
  INDEX idx_ritual_sensitivity (sensitivity)
);

CREATE TABLE IF NOT EXISTS puyuma_vocabulary_categories (
  id VARCHAR(80) PRIMARY KEY,
  category_key VARCHAR(80) NOT NULL UNIQUE,
  label_zh VARCHAR(120) NOT NULL,
  description_zh TEXT NULL,
  sort_order INT NOT NULL DEFAULT 100,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS puyuma_corpus_entries (
  id VARCHAR(120) PRIMARY KEY,
  corpus_scope ENUM('preview_subset','full_corpus','manual_curated') NOT NULL DEFAULT 'preview_subset',
  entry_type ENUM('word','phrase','sentence','paragraph') NOT NULL DEFAULT 'sentence',
  language_zh VARCHAR(40) NOT NULL DEFAULT '卑南語',
  dialect_code VARCHAR(10) NOT NULL,
  dialect_name VARCHAR(120) NOT NULL,
  dialect_zh VARCHAR(80) NOT NULL,
  community_key VARCHAR(80) NULL,
  category_key VARCHAR(80) NULL,
  puyuma_form TEXT NOT NULL,
  zh_tw TEXT NULL,
  en TEXT NULL,
  source_phon TEXT NULL,
  ipa_value TEXT NULL,
  ipa_status ENUM('source_phon','rule_based_draft','linguist_verified','missing') NOT NULL DEFAULT 'missing',
  g2p_json JSON NULL,
  tts_json JSON NULL,
  source_id VARCHAR(120) NOT NULL,
  source_path TEXT NULL,
  source_row INT NULL,
  source_format ENUM('csv','xml','manual','unknown') NOT NULL DEFAULT 'unknown',
  review_status ENUM('approved_for_public_learning','needs_review','rejected','archived') NOT NULL DEFAULT 'needs_review',
  sensitivity ENUM('public','medium','high') NOT NULL DEFAULT 'public',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_corpus_text (puyuma_form, zh_tw, en),
  INDEX idx_corpus_scope (corpus_scope),
  INDEX idx_corpus_dialect (dialect_code),
  INDEX idx_corpus_category (category_key),
  INDEX idx_corpus_review (review_status)
);

CREATE TABLE IF NOT EXISTS puyuma_audio_assets (
  id VARCHAR(120) PRIMARY KEY,
  corpus_entry_id VARCHAR(120) NOT NULL,
  remote_url TEXT NOT NULL,
  mime_type VARCHAR(80) NOT NULL DEFAULT 'audio/mpeg',
  provider VARCHAR(160) NULL,
  storage_mode ENUM('remote_url','mirrored_local','r2','s3','cdn') NOT NULL DEFAULT 'remote_url',
  local_mirror_path TEXT NULL,
  duration_seconds DECIMAL(8,2) NULL,
  license_review_status ENUM('not_reviewed','approved','blocked','not_required') NOT NULL DEFAULT 'not_reviewed',
  playback_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_audio_entry (corpus_entry_id),
  INDEX idx_audio_license (license_review_status),
  CONSTRAINT fk_audio_corpus_entry FOREIGN KEY (corpus_entry_id) REFERENCES puyuma_corpus_entries(id)
);

CREATE TABLE IF NOT EXISTS puyuma_ipa_annotations (
  id VARCHAR(120) PRIMARY KEY,
  corpus_entry_id VARCHAR(120) NOT NULL,
  annotation_type ENUM('source_phon','rule_based_g2p','linguist_reviewed') NOT NULL,
  ipa_text TEXT NOT NULL,
  reviewer VARCHAR(120) NULL,
  review_status ENUM('draft','approved','rejected') NOT NULL DEFAULT 'draft',
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ipa_entry (corpus_entry_id),
  CONSTRAINT fk_ipa_entry FOREIGN KEY (corpus_entry_id) REFERENCES puyuma_corpus_entries(id)
);

CREATE TABLE IF NOT EXISTS puyuma_tts_jobs (
  id VARCHAR(120) PRIMARY KEY,
  corpus_entry_id VARCHAR(120) NOT NULL,
  tts_text TEXT NOT NULL,
  status ENUM('metadata_only','queued','generated','approved','blocked') NOT NULL DEFAULT 'metadata_only',
  public_ui_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  generated_audio_asset_id VARCHAR(120) NULL,
  review_required BOOLEAN NOT NULL DEFAULT TRUE,
  blocked_reason TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tts_status (status),
  CONSTRAINT fk_tts_entry FOREIGN KEY (corpus_entry_id) REFERENCES puyuma_corpus_entries(id)
);

CREATE TABLE IF NOT EXISTS kb_entity_relations (
  id VARCHAR(120) PRIMARY KEY,
  subject_type VARCHAR(80) NOT NULL,
  subject_id VARCHAR(120) NOT NULL,
  predicate VARCHAR(120) NOT NULL,
  object_type VARCHAR(80) NOT NULL,
  object_id VARCHAR(120) NOT NULL,
  visibility ENUM('public','summary_only','restricted') NOT NULL DEFAULT 'summary_only',
  source_ids_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_relation_subject (subject_type, subject_id),
  INDEX idx_relation_object (object_type, object_id)
);

CREATE TABLE IF NOT EXISTS kb_review_tasks (
  id VARCHAR(120) PRIMARY KEY,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(120) NOT NULL,
  task_type ENUM('source_check','sensitivity_check','linguist_review','community_review','license_review','publish_review') NOT NULL,
  priority ENUM('p0','p1','p2','p3') NOT NULL DEFAULT 'p2',
  status ENUM('open','in_progress','approved','rejected','archived') NOT NULL DEFAULT 'open',
  assigned_role VARCHAR(120) NULL,
  notes TEXT NULL,
  due_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_review_entity (entity_type, entity_id),
  INDEX idx_review_status_priority (status, priority)
);

CREATE TABLE IF NOT EXISTS kb_import_runs (
  id VARCHAR(120) PRIMARY KEY,
  import_key VARCHAR(120) NOT NULL,
  import_type ENUM('facts','communities','rituals','vocabulary_preview','formosanbank_full_corpus','audio_mirror','search_index') NOT NULL,
  status ENUM('planned','running','completed','failed','rolled_back') NOT NULL DEFAULT 'planned',
  source_count INT NOT NULL DEFAULT 0,
  rows_inserted INT NOT NULL DEFAULT 0,
  rows_updated INT NOT NULL DEFAULT 0,
  rows_rejected INT NOT NULL DEFAULT 0,
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  summary_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_import_type_status (import_type, status)
);

CREATE TABLE IF NOT EXISTS kb_import_errors (
  id VARCHAR(120) PRIMARY KEY,
  import_run_id VARCHAR(120) NOT NULL,
  source_path TEXT NULL,
  source_row INT NULL,
  severity ENUM('info','warning','error','critical') NOT NULL DEFAULT 'error',
  error_code VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  raw_payload_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_error_run (import_run_id),
  CONSTRAINT fk_import_error_run FOREIGN KEY (import_run_id) REFERENCES kb_import_runs(id)
);

CREATE TABLE IF NOT EXISTS kb_search_documents (
  id VARCHAR(120) PRIMARY KEY,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(120) NOT NULL,
  title_zh VARCHAR(255) NOT NULL,
  body_zh TEXT NOT NULL,
  keywords_json JSON NULL,
  visibility ENUM('public','admin_only','restricted') NOT NULL DEFAULT 'public',
  weight INT NOT NULL DEFAULT 10,
  source_ids_json JSON NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_search_doc (title_zh, body_zh),
  INDEX idx_search_entity (entity_type, entity_id),
  INDEX idx_search_visibility (visibility)
);

CREATE TABLE IF NOT EXISTS ops_audio_mirror_queue (
  id VARCHAR(120) PRIMARY KEY,
  audio_asset_id VARCHAR(120) NOT NULL,
  remote_url TEXT NOT NULL,
  target_storage ENUM('r2','s3','cdn','local') NOT NULL DEFAULT 'r2',
  target_path TEXT NOT NULL,
  status ENUM('blocked_license','queued','running','completed','failed') NOT NULL DEFAULT 'blocked_license',
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mirror_status (status),
  CONSTRAINT fk_mirror_audio FOREIGN KEY (audio_asset_id) REFERENCES puyuma_audio_assets(id)
);

CREATE TABLE IF NOT EXISTS ops_data_snapshots (
  id VARCHAR(120) PRIMARY KEY,
  snapshot_key VARCHAR(120) NOT NULL,
  snapshot_type ENUM('pre_import','post_import','release','rollback') NOT NULL,
  entity_counts_json JSON NOT NULL,
  file_manifest_json JSON NULL,
  created_by VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_snapshot_key (snapshot_key)
);

CREATE TABLE IF NOT EXISTS kb_content_versions (
  id VARCHAR(120) PRIMARY KEY,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(120) NOT NULL,
  version_no INT NOT NULL,
  change_type ENUM('create','update','review','publish','archive','rollback') NOT NULL,
  payload_json JSON NOT NULL,
  changed_by VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_content_version (entity_type, entity_id, version_no),
  INDEX idx_version_entity (entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS kb_audit_logs (
  id VARCHAR(120) PRIMARY KEY,
  actor_id VARCHAR(120) NULL,
  actor_role VARCHAR(120) NULL,
  action VARCHAR(160) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(120) NOT NULL,
  before_json JSON NULL,
  after_json JSON NULL,
  ip_address VARCHAR(80) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_action (action)
);

CREATE TABLE IF NOT EXISTS admin_roles (
  id VARCHAR(80) PRIMARY KEY,
  role_key VARCHAR(80) NOT NULL UNIQUE,
  name_zh VARCHAR(120) NOT NULL,
  description_zh TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_permissions (
  id VARCHAR(100) PRIMARY KEY,
  permission_key VARCHAR(120) NOT NULL UNIQUE,
  module_key VARCHAR(80) NOT NULL,
  action_key VARCHAR(80) NOT NULL,
  description_zh TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_role_permissions (
  role_key VARCHAR(80) NOT NULL,
  permission_key VARCHAR(120) NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_key, permission_key),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_key) REFERENCES admin_roles(role_key),
  CONSTRAINT fk_rp_perm FOREIGN KEY (permission_key) REFERENCES admin_permissions(permission_key)
);
