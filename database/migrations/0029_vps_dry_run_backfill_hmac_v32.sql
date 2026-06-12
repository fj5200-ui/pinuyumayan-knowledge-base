-- v32 VPS dry-run backfill, HMAC enforcement, main-site migration evidence
CREATE TABLE IF NOT EXISTS vps_dry_run_backfill_runs_v32 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(96) NOT NULL UNIQUE,
  environment VARCHAR(32) NOT NULL DEFAULT 'staging',
  status VARCHAR(32) NOT NULL DEFAULT 'received',
  actual_vps_run BOOLEAN NOT NULL DEFAULT FALSE,
  report_sha256 CHAR(64) NOT NULL,
  blockers_json JSON NULL,
  report_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS main_site_migration_evidence_v32 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  evidence_id VARCHAR(96) NOT NULL UNIQUE,
  copied_routes_json JSON NOT NULL,
  secret_scan_status VARCHAR(32) NOT NULL,
  leaked_secret_count INT NOT NULL DEFAULT 0,
  kb_health_status VARCHAR(32) NOT NULL DEFAULT 'unknown',
  report_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hmac_enforcement_reports_v32 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_id VARCHAR(96) NOT NULL UNIQUE,
  mode VARCHAR(32) NOT NULL DEFAULT 'report_only',
  protected_route_count INT NOT NULL DEFAULT 0,
  uncovered_route_count INT NOT NULL DEFAULT 0,
  replay_blocked_count INT NOT NULL DEFAULT 0,
  report_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS full_corpus_backfill_reports_v32 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_id VARCHAR(96) NOT NULL UNIQUE,
  total_entries INT NOT NULL DEFAULT 0,
  required_min_entries INT NOT NULL DEFAULT 1000,
  audio_coverage_ratio DECIMAL(6,5) NULL,
  source_phon_coverage_ratio DECIMAL(6,5) NULL,
  status VARCHAR(32) NOT NULL,
  report_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_seo_validation_runs_v32 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(96) NOT NULL UNIQUE,
  search_status VARCHAR(32) NOT NULL,
  seo_status VARCHAR(32) NOT NULL,
  forbidden_relation_hits INT NOT NULL DEFAULT 0,
  report_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_fallback_enforcement_events_v32 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_id VARCHAR(96) NOT NULL UNIQUE,
  route_path VARCHAR(255) NOT NULL,
  environment VARCHAR(32) NOT NULL,
  fallback_attempted BOOLEAN NOT NULL DEFAULT FALSE,
  fallback_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  event_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
