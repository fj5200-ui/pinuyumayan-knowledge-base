-- 0024_vps_full_corpus_search_backup_v27.sql
-- v27: VPS staging full-corpus acceptance, production data-mode policy, search index operations, and backup restore drill evidence.

CREATE TABLE IF NOT EXISTS full_corpus_import_jobs_v27 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  job_key VARCHAR(160) NOT NULL UNIQUE,
  environment ENUM('local','staging','production') NOT NULL DEFAULT 'staging',
  min_entries_required INT NOT NULL DEFAULT 1000,
  status ENUM('queued','running','passed','failed','manual_review') NOT NULL DEFAULT 'queued',
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  command_text TEXT NULL,
  report_key VARCHAR(160) NULL,
  error_text TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_full_corpus_jobs_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS full_corpus_acceptance_metrics_v27 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_key VARCHAR(160) NOT NULL UNIQUE,
  job_key VARCHAR(160) NULL,
  total_entries INT NOT NULL DEFAULT 0,
  required_min_entries INT NOT NULL DEFAULT 1000,
  dialect_count_json JSON NULL,
  audio_asset_count INT NOT NULL DEFAULT 0,
  audio_coverage_ratio DECIMAL(7,4) NULL,
  source_phon_count INT NOT NULL DEFAULT 0,
  source_phon_coverage_ratio DECIMAL(7,4) NULL,
  duplicate_count INT NOT NULL DEFAULT 0,
  license_blocker_count INT NOT NULL DEFAULT 0,
  public_candidate_count INT NOT NULL DEFAULT 0,
  status ENUM('pending','passed','failed','manual_review') NOT NULL DEFAULT 'pending',
  report_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_full_corpus_acceptance_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS production_data_mode_events_v27 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  route_group VARCHAR(160) NOT NULL,
  data_mode ENUM('static','db','hybrid') NOT NULL,
  environment ENUM('development','staging','production') NOT NULL,
  fallback_attempted BOOLEAN NOT NULL DEFAULT FALSE,
  fallback_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('ok','warning','blocked','failed') NOT NULL,
  detail_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_data_mode_events_created (created_at),
  INDEX idx_data_mode_events_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS db_fallback_events_v27 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  route_path VARCHAR(512) NOT NULL,
  route_group VARCHAR(160) NOT NULL,
  environment ENUM('development','staging','production') NOT NULL,
  fallback_source VARCHAR(160) NULL,
  db_error_code VARCHAR(120) NULL,
  db_error_message TEXT NULL,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  request_id VARCHAR(80) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_db_fallback_created (created_at),
  INDEX idx_db_fallback_blocked_created (blocked, created_at)
);

CREATE TABLE IF NOT EXISTS search_index_documents_v27 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  document_key VARCHAR(180) NOT NULL UNIQUE,
  source_type ENUM('knowledge_card','claim','vocabulary','pronunciation','article') NOT NULL,
  source_id VARCHAR(180) NOT NULL,
  title TEXT NOT NULL,
  body_text MEDIUMTEXT NOT NULL,
  tags_json JSON NULL,
  language_code VARCHAR(16) NOT NULL DEFAULT 'zh-TW',
  release_channel VARCHAR(80) NOT NULL DEFAULT 'public',
  forbidden_relation_flag BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_search_index_title_body (title, body_text),
  INDEX idx_search_source (source_type, source_id),
  INDEX idx_search_release_updated (release_channel, updated_at)
);

CREATE TABLE IF NOT EXISTS search_zero_result_logs_v27 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  query_text VARCHAR(512) NOT NULL,
  normalized_query VARCHAR(512) NOT NULL,
  route_path VARCHAR(512) NULL,
  user_scope ENUM('public','admin','internal') NOT NULL DEFAULT 'public',
  blocked_forbidden_relation BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_zero_result_created (created_at),
  INDEX idx_zero_result_normalized (normalized_query)
);

CREATE TABLE IF NOT EXISTS search_rebuild_runs_v27 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_key VARCHAR(160) NOT NULL UNIQUE,
  adapter_key ENUM('mysql_fulltext','meilisearch','typesense') NOT NULL DEFAULT 'mysql_fulltext',
  status ENUM('queued','running','completed','failed') NOT NULL DEFAULT 'queued',
  document_count INT NOT NULL DEFAULT 0,
  error_text TEXT NULL,
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vps_backup_restore_drills_v27 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  drill_key VARCHAR(160) NOT NULL UNIQUE,
  backup_key VARCHAR(160) NOT NULL,
  restore_target VARCHAR(180) NOT NULL,
  status ENUM('started','restored','verified','failed') NOT NULL DEFAULT 'started',
  row_count_checks_json JSON NULL,
  checksum_checks_json JSON NULL,
  restore_started_at DATETIME NULL,
  restore_finished_at DATETIME NULL,
  verified_at DATETIME NULL,
  operator_label VARCHAR(160) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_restore_drills_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS source_candidate_ingestion_runs_v27 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_key VARCHAR(160) NOT NULL UNIQUE,
  adapter_key VARCHAR(120) NOT NULL,
  status ENUM('planned','running','completed','failed','blocked_forbidden_relation') NOT NULL DEFAULT 'planned',
  candidate_count INT NOT NULL DEFAULT 0,
  blocked_count INT NOT NULL DEFAULT 0,
  output_file VARCHAR(255) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME NULL,
  INDEX idx_source_candidate_adapter_created (adapter_key, created_at)
);

CREATE TABLE IF NOT EXISTS admin_ui_integration_checks_v27 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  page_key VARCHAR(160) NOT NULL,
  api_path VARCHAR(255) NOT NULL,
  status ENUM('not_started','wired','verified','failed') NOT NULL DEFAULT 'not_started',
  detail_json JSON NULL,
  checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admin_ui_page_api (page_key, api_path)
);
