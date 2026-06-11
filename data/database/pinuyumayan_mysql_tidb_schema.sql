-- 卑南族文化綜合平台 Knowledge Database v3
-- Target: MySQL 8 / TiDB Cloud Starter compatible
-- Note: JSON columns are used for flexible source_ids/tags/policy payloads.

CREATE TABLE IF NOT EXISTS kb_sources (
  id VARCHAR(80) PRIMARY KEY,
  source_id VARCHAR(80) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  url TEXT NULL,
  publisher VARCHAR(255) NULL,
  source_type ENUM('official','academic','community','dataset','internal_review','unknown') NOT NULL,
  license VARCHAR(120) NULL,
  trust_level ENUM('primary','high','medium','low','unknown') NOT NULL DEFAULT 'unknown',
  review_status ENUM('verified','needs_review','rejected','archived') NOT NULL DEFAULT 'needs_review',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_kb_sources_type (source_type),
  INDEX idx_kb_sources_review (review_status)
);

CREATE TABLE IF NOT EXISTS kb_facts (
  id VARCHAR(80) PRIMARY KEY,
  fact_id VARCHAR(80) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  statement_zh TEXT NOT NULL,
  statement_en TEXT NULL,
  source_ids JSON NOT NULL,
  evidence_hint TEXT NULL,
  sensitivity ENUM('public','medium','high','restricted') NOT NULL DEFAULT 'public',
  verification_status ENUM('verified','needs_review','conflicting','rejected') NOT NULL DEFAULT 'needs_review',
  public_use_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  content_policy JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_kb_facts_category (category),
  INDEX idx_kb_facts_sensitivity (sensitivity),
  INDEX idx_kb_facts_verification (verification_status)
);

CREATE TABLE IF NOT EXISTS kb_communities (
  id VARCHAR(80) PRIMARY KEY,
  community_key VARCHAR(80) NOT NULL UNIQUE,
  name_zh VARCHAR(80) NOT NULL,
  romanization VARCHAR(120) NULL,
  also_known_as JSON NULL,
  origin_system VARCHAR(120) NULL,
  platform_summary TEXT NULL,
  source_ids JSON NOT NULL,
  review_status ENUM('verified','needs_review','hidden') NOT NULL DEFAULT 'needs_review',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_kb_communities_name (name_zh)
);

CREATE TABLE IF NOT EXISTS kb_rituals (
  id VARCHAR(80) PRIMARY KEY,
  ritual_key VARCHAR(80) NOT NULL UNIQUE,
  name_zh VARCHAR(120) NOT NULL,
  month_hint VARCHAR(80) NULL,
  public_summary TEXT NOT NULL,
  source_ids JSON NOT NULL,
  sensitivity ENUM('public','medium','high','restricted') NOT NULL DEFAULT 'medium',
  do_not_publish JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_kb_rituals_sensitivity (sensitivity)
);

CREATE TABLE IF NOT EXISTS puyuma_audio_assets (
  id VARCHAR(80) PRIMARY KEY,
  audio_asset_id VARCHAR(120) NOT NULL UNIQUE,
  source_audio_url TEXT NOT NULL,
  mirror_url TEXT NULL,
  local_path TEXT NULL,
  duration_sec DECIMAL(8,2) NULL,
  mime_type VARCHAR(80) NULL,
  license VARCHAR(120) NULL,
  mirror_status ENUM('not_mirrored','queued','mirrored','failed','license_blocked') NOT NULL DEFAULT 'not_mirrored',
  last_checked_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_puyuma_audio_mirror (mirror_status)
);

CREATE TABLE IF NOT EXISTS puyuma_corpus_entries (
  id VARCHAR(80) PRIMARY KEY,
  entry_id VARCHAR(120) NOT NULL UNIQUE,
  dataset_scope ENUM('preview_subset','full_corpus','manual_curated') NOT NULL DEFAULT 'preview_subset',
  dialect_code VARCHAR(10) NOT NULL,
  dialect_name VARCHAR(80) NOT NULL,
  community_key VARCHAR(80) NULL,
  entry_type ENUM('sentence','word','phrase','dialogue','story_line') NOT NULL DEFAULT 'sentence',
  category VARCHAR(80) NULL,
  puyuma_text TEXT NOT NULL,
  zh_tw TEXT NULL,
  en TEXT NULL,
  source_phon TEXT NULL,
  g2p_output JSON NULL,
  ipa_value TEXT NULL,
  ipa_status ENUM('source_phon','rule_based_draft','manual_verified','missing') NOT NULL DEFAULT 'missing',
  audio_asset_id VARCHAR(120) NULL,
  source_id VARCHAR(80) NOT NULL,
  source_path TEXT NULL,
  source_row_or_sentence_id VARCHAR(80) NULL,
  source_format ENUM('csv','xml','json','manual') NOT NULL,
  copyright VARCHAR(120) NULL,
  review_status ENUM('verified','needs_review','blocked') NOT NULL DEFAULT 'needs_review',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_puyuma_text (puyuma_text),
  INDEX idx_puyuma_dialect (dialect_code),
  INDEX idx_puyuma_scope (dataset_scope),
  INDEX idx_puyuma_ipa_status (ipa_status),
  CONSTRAINT fk_puyuma_audio_asset FOREIGN KEY (audio_asset_id) REFERENCES puyuma_audio_assets(audio_asset_id)
);

CREATE TABLE IF NOT EXISTS puyuma_tts_jobs (
  id VARCHAR(80) PRIMARY KEY,
  job_id VARCHAR(120) NOT NULL UNIQUE,
  entry_id VARCHAR(120) NOT NULL,
  tts_text TEXT NOT NULL,
  voice_profile VARCHAR(120) NULL,
  provider VARCHAR(120) NULL,
  output_audio_url TEXT NULL,
  status ENUM('disabled','queued','generated','needs_native_review','approved','rejected') NOT NULL DEFAULT 'disabled',
  public_ui_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tts_entry (entry_id),
  INDEX idx_tts_status (status)
);

CREATE TABLE IF NOT EXISTS kb_review_tasks (
  id VARCHAR(80) PRIMARY KEY,
  task_id VARCHAR(120) NOT NULL UNIQUE,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(120) NOT NULL,
  review_type ENUM('source_check','cultural_sensitivity','language_review','audio_license','publication') NOT NULL,
  priority ENUM('low','normal','high','critical') NOT NULL DEFAULT 'normal',
  status ENUM('open','in_review','approved','blocked','closed') NOT NULL DEFAULT 'open',
  assigned_role VARCHAR(80) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_review_status (status),
  INDEX idx_review_type (review_type)
);

CREATE TABLE IF NOT EXISTS kb_import_runs (
  id VARCHAR(80) PRIMARY KEY,
  run_id VARCHAR(120) NOT NULL UNIQUE,
  pipeline_name VARCHAR(120) NOT NULL,
  input_manifest TEXT NULL,
  output_path TEXT NULL,
  expected_min_entries INT NULL,
  actual_entries INT NOT NULL DEFAULT 0,
  audio_entries INT NOT NULL DEFAULT 0,
  source_phon_entries INT NOT NULL DEFAULT 0,
  status ENUM('planned','running','passed','failed','partial') NOT NULL DEFAULT 'planned',
  report_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_import_pipeline (pipeline_name),
  INDEX idx_import_status (status)
);

CREATE TABLE IF NOT EXISTS kb_search_documents (
  id VARCHAR(80) PRIMARY KEY,
  doc_id VARCHAR(120) NOT NULL UNIQUE,
  doc_type VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body MEDIUMTEXT NOT NULL,
  route VARCHAR(255) NULL,
  tags JSON NULL,
  source_ids JSON NULL,
  sensitivity ENUM('public','medium','high','restricted') NOT NULL DEFAULT 'public',
  review_status ENUM('published','draft','needs_review','blocked') NOT NULL DEFAULT 'draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_search_title_body (title, body),
  INDEX idx_search_doc_type (doc_type),
  INDEX idx_search_review (review_status)
);
