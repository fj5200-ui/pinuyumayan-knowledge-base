-- 0026_vps_actual_ops_v29.sql
-- v29: VPS actual execution records, DB-backed live dashboard, search population, fallback coverage, backup checksum.

CREATE TABLE IF NOT EXISTS full_corpus_execution_runs_v29 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_key VARCHAR(160) NOT NULL UNIQUE,
  environment ENUM('staging','production','restore','development') NOT NULL DEFAULT 'staging',
  database_target VARCHAR(240) NULL,
  min_entries INT NOT NULL DEFAULT 1000,
  status ENUM('queued','running','passed','failed','manual_review','promoted') NOT NULL DEFAULT 'queued',
  total_entries INT NOT NULL DEFAULT 0,
  audio_asset_count INT NOT NULL DEFAULT 0,
  source_phon_count INT NOT NULL DEFAULT 0,
  duplicate_count INT NOT NULL DEFAULT 0,
  license_blocker_count INT NOT NULL DEFAULT 0,
  forbidden_relation_hits INT NOT NULL DEFAULT 0,
  dialect_counts_json JSON NULL,
  report_json JSON NULL,
  operator VARCHAR(190) NULL,
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_full_corpus_runs_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS full_corpus_execution_findings_v29 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_key VARCHAR(160) NOT NULL,
  severity ENUM('info','warning','critical') NOT NULL DEFAULT 'info',
  finding_code VARCHAR(120) NOT NULL,
  finding_text TEXT NOT NULL,
  source_ref VARCHAR(240) NULL,
  finding_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_full_corpus_findings_run_severity (run_key, severity)
);

CREATE TABLE IF NOT EXISTS live_dashboard_panels_v29 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  panel_key VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(240) NOT NULL,
  api_path VARCHAR(320) NOT NULL,
  required_scope VARCHAR(160) NOT NULL,
  status ENUM('ready','warning','critical','disabled') NOT NULL DEFAULT 'ready',
  last_snapshot_json JSON NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_index_population_runs_v29 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_key VARCHAR(160) NOT NULL UNIQUE,
  status ENUM('queued','running','completed','failed','manual_review') NOT NULL DEFAULT 'queued',
  source_counts_json JSON NULL,
  inserted_count INT NOT NULL DEFAULT 0,
  updated_count INT NOT NULL DEFAULT 0,
  skipped_forbidden_count INT NOT NULL DEFAULT 0,
  skipped_not_public_count INT NOT NULL DEFAULT 0,
  error_text TEXT NULL,
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_pop_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS fallback_route_coverage_v29 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  route_group VARCHAR(240) NOT NULL UNIQUE,
  fallback_policy ENUM('db_required','static_allowed_dev_only','hybrid_allowed','not_db_backed') NOT NULL DEFAULT 'db_required',
  production_covered BOOLEAN NOT NULL DEFAULT FALSE,
  middleware_name VARCHAR(160) NULL,
  last_checked_at DATETIME NULL,
  finding_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fallback_coverage_prod (production_covered)
);

CREATE TABLE IF NOT EXISTS vps_backup_restore_checksum_reports_v29 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_key VARCHAR(160) NOT NULL UNIQUE,
  backup_file VARCHAR(512) NOT NULL,
  backup_sha256 VARCHAR(80) NULL,
  target_database VARCHAR(160) NOT NULL,
  status ENUM('started','restored','verified','failed','manual_review') NOT NULL DEFAULT 'started',
  row_counts_json JSON NULL,
  checksums_json JSON NULL,
  operator VARCHAR(190) NULL,
  report_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME NULL,
  INDEX idx_vps_checksum_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS source_candidate_human_reviews_v29 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_key VARCHAR(180) NOT NULL UNIQUE,
  adapter_key VARCHAR(120) NOT NULL,
  source_url TEXT NULL,
  publisher VARCHAR(240) NULL,
  license_status VARCHAR(120) NULL,
  claim_text TEXT NOT NULL,
  review_status ENUM('candidate','approved_to_claim','rejected','needs_more_source','blocked_forbidden_relation') NOT NULL DEFAULT 'candidate',
  forbidden_relation_hit BOOLEAN NOT NULL DEFAULT FALSE,
  duplicate_claim_hit BOOLEAN NOT NULL DEFAULT FALSE,
  reviewer VARCHAR(190) NULL,
  review_note TEXT NULL,
  reviewed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_source_human_review_status_created (review_status, created_at),
  INDEX idx_source_human_review_adapter_created (adapter_key, created_at)
);
