-- v30 Production cutover / formal launch readiness layer
CREATE TABLE IF NOT EXISTS production_cutover_runs_v30 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(80) NOT NULL UNIQUE,
  environment VARCHAR(40) NOT NULL DEFAULT 'staging',
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  passed_checks INT NOT NULL DEFAULT 0,
  failed_checks INT NOT NULL DEFAULT 0,
  blocker_count INT NOT NULL DEFAULT 0,
  report_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS production_cutover_check_results_v30 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(80) NOT NULL,
  phase_id VARCHAR(80) NOT NULL,
  check_id VARCHAR(120) NOT NULL,
  status VARCHAR(40) NOT NULL,
  severity VARCHAR(40) NOT NULL DEFAULT 'required',
  detail TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cutover_result_run (run_id),
  UNIQUE KEY uniq_cutover_check (run_id, check_id)
);
CREATE TABLE IF NOT EXISTS main_site_acceptance_runs_v30 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(80) NOT NULL UNIQUE,
  main_site_url VARCHAR(255) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  result_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS production_secret_rotation_events_v30 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  secret_name VARCHAR(120) NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'planned',
  actor_admin_id VARCHAR(80) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS production_seo_launch_checks_v30 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  article_id VARCHAR(120) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  canonical_url VARCHAR(500) NULL,
  og_image_url VARCHAR(500) NULL,
  finding_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_seo_slug_v30 (slug)
);
CREATE TABLE IF NOT EXISTS search_quality_runs_v30 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(80) NOT NULL UNIQUE,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  total_queries INT NOT NULL DEFAULT 0,
  passed_queries INT NOT NULL DEFAULT 0,
  failed_queries INT NOT NULL DEFAULT 0,
  result_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS production_rollback_events_v30 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rollback_id VARCHAR(80) NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  target_version VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'planned',
  actor VARCHAR(120) NULL,
  result_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS production_readiness_blockers_v30 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  blocker_key VARCHAR(160) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(40) NOT NULL DEFAULT 'blocker',
  status VARCHAR(40) NOT NULL DEFAULT 'open',
  owner VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL
);
