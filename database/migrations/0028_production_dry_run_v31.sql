-- v31 Production dry-run and migration acceptance layer
CREATE TABLE IF NOT EXISTS production_dry_run_reports_v31 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  environment VARCHAR(32) NOT NULL DEFAULT 'staging',
  report_status VARCHAR(32) NOT NULL DEFAULT 'received',
  checklist_hash CHAR(64) NULL,
  blocker_count INT NOT NULL DEFAULT 0,
  warning_count INT NOT NULL DEFAULT 0,
  payload_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS main_site_migration_reports_v31 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  site_url VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'received',
  tests_total INT NOT NULL DEFAULT 0,
  tests_passed INT NOT NULL DEFAULT 0,
  secret_scan_passed BOOLEAN NOT NULL DEFAULT FALSE,
  payload_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hmac_route_coverage_reports_v31 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  coverage_status VARCHAR(32) NOT NULL DEFAULT 'received',
  internal_route_count INT NOT NULL DEFAULT 0,
  protected_route_count INT NOT NULL DEFAULT 0,
  uncovered_route_count INT NOT NULL DEFAULT 0,
  payload_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS corpus_report_backfill_runs_v31 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_report_path VARCHAR(512) NOT NULL,
  total_entries INT NOT NULL DEFAULT 0,
  required_min_entries INT NOT NULL DEFAULT 1000,
  status VARCHAR(32) NOT NULL DEFAULT 'received',
  payload_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_live_dashboard_events_v31 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  panel_key VARCHAR(80) NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  severity VARCHAR(32) NOT NULL DEFAULT 'info',
  payload_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_live_dashboard_events_v31_panel (panel_key, created_at)
);

CREATE TABLE IF NOT EXISTS search_quality_reports_v31 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  suite_version VARCHAR(32) NOT NULL DEFAULT 'v31',
  status VARCHAR(32) NOT NULL DEFAULT 'received',
  total_queries INT NOT NULL DEFAULT 0,
  passed_queries INT NOT NULL DEFAULT 0,
  forbidden_relation_failures INT NOT NULL DEFAULT 0,
  payload_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_candidate_intake_runs_v31 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_key VARCHAR(80) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'candidate_needs_human_review',
  candidate_count INT NOT NULL DEFAULT 0,
  blocked_relation_count INT NOT NULL DEFAULT 0,
  payload_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_source_candidate_intake_runs_v31_source (source_key, created_at)
);
