-- 0025_vps_live_ops_search_fallback_v28.sql
-- v28: live VPS operations, production fallback enforcement, MySQL FULLTEXT build runs, admin live dashboard support.

CREATE TABLE IF NOT EXISTS production_fallback_events_v28 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  route_path VARCHAR(512) NOT NULL,
  route_group VARCHAR(160) NOT NULL,
  environment ENUM('development','staging','production') NOT NULL,
  data_mode ENUM('static','db','hybrid') NOT NULL,
  attempted_static_fallback BOOLEAN NOT NULL DEFAULT FALSE,
  fallback_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  db_error_code VARCHAR(120) NULL,
  db_error_message TEXT NULL,
  request_id VARCHAR(80) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prod_fallback_created (created_at),
  INDEX idx_prod_fallback_blocked_created (fallback_blocked, created_at)
);

CREATE TABLE IF NOT EXISTS search_index_build_runs_v28 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_key VARCHAR(160) NOT NULL UNIQUE,
  adapter ENUM('mysql_fulltext','meilisearch','typesense') NOT NULL DEFAULT 'mysql_fulltext',
  status ENUM('queued','running','completed','failed','manual_review') NOT NULL DEFAULT 'queued',
  source_counts_json JSON NULL,
  indexed_count INT NOT NULL DEFAULT 0,
  forbidden_relation_skipped_count INT NOT NULL DEFAULT 0,
  zero_result_queries_since_last_run INT NOT NULL DEFAULT 0,
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  error_text TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_build_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS search_index_build_items_v28 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_key VARCHAR(160) NOT NULL,
  document_key VARCHAR(180) NOT NULL,
  source_type VARCHAR(80) NOT NULL,
  source_id VARCHAR(180) NOT NULL,
  action ENUM('inserted','updated','skipped_forbidden','skipped_not_public','failed') NOT NULL,
  finding_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_build_items_run (run_key, action),
  INDEX idx_search_build_items_doc (document_key)
);

CREATE TABLE IF NOT EXISTS admin_live_dashboard_events_v28 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  panel_key VARCHAR(120) NOT NULL,
  severity ENUM('info','warning','critical') NOT NULL DEFAULT 'info',
  title VARCHAR(240) NOT NULL,
  detail_json JSON NULL,
  acknowledged_by VARCHAR(190) NULL,
  acknowledged_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_live_events_panel_created (panel_key, created_at),
  INDEX idx_admin_live_events_severity_created (severity, created_at)
);

CREATE TABLE IF NOT EXISTS vps_restore_drill_reports_v28 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  drill_key VARCHAR(160) NOT NULL UNIQUE,
  backup_key VARCHAR(160) NOT NULL,
  target_database VARCHAR(160) NOT NULL,
  status ENUM('started','verified','failed','manual_review') NOT NULL DEFAULT 'started',
  row_count_json JSON NULL,
  checksum_json JSON NULL,
  operator VARCHAR(190) NULL,
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  report_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vps_restore_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS source_candidate_review_items_v28 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_key VARCHAR(180) NOT NULL UNIQUE,
  adapter_key VARCHAR(120) NOT NULL,
  source_title TEXT NOT NULL,
  source_url TEXT NULL,
  publisher VARCHAR(240) NULL,
  license_status VARCHAR(120) NULL,
  claim_text TEXT NOT NULL,
  forbidden_relation_hit BOOLEAN NOT NULL DEFAULT FALSE,
  duplicate_candidate_hit BOOLEAN NOT NULL DEFAULT FALSE,
  sensitivity VARCHAR(120) NOT NULL DEFAULT 'normal',
  review_status ENUM('candidate','approved','rejected','needs_more_source','blocked_forbidden_relation') NOT NULL DEFAULT 'candidate',
  reviewer VARCHAR(190) NULL,
  reviewed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_source_candidate_status_created (review_status, created_at),
  INDEX idx_source_candidate_adapter_created (adapter_key, created_at)
);
