-- 0006_runtime_hardening.sql
-- Runtime hardening for API observability, job locks, full-corpus import tracking, and main-site contract verification.

CREATE TABLE IF NOT EXISTS api_request_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id VARCHAR(80) NOT NULL,
  route VARCHAR(255) NOT NULL,
  method VARCHAR(16) NOT NULL,
  status_code INT NOT NULL,
  latency_ms INT NULL,
  client_type ENUM('public','main_site_internal','admin','system') DEFAULT 'public',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_api_request_logs_request_id (request_id),
  INDEX idx_api_request_logs_created_at (created_at),
  INDEX idx_api_request_logs_route_created (route, created_at)
);

CREATE TABLE IF NOT EXISTS api_error_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id VARCHAR(80) NULL,
  error_code VARCHAR(80) NOT NULL,
  status_code INT NOT NULL,
  route VARCHAR(255) NULL,
  public_message VARCHAR(512) NULL,
  internal_message TEXT NULL,
  details_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_api_error_events_code_created (error_code, created_at)
);

CREATE TABLE IF NOT EXISTS runtime_config_flags (
  flag_key VARCHAR(120) PRIMARY KEY,
  flag_value JSON NOT NULL,
  environment VARCHAR(40) DEFAULT 'all',
  description TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_queue (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  job_type VARCHAR(80) NOT NULL,
  queue_name VARCHAR(80) NOT NULL DEFAULT 'default',
  status ENUM('queued','running','succeeded','failed','cancelled') NOT NULL DEFAULT 'queued',
  priority INT NOT NULL DEFAULT 100,
  payload_json JSON NULL,
  result_json JSON NULL,
  error_message TEXT NULL,
  run_after TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  finished_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_job_queue_status_priority (status, priority, run_after),
  INDEX idx_job_queue_type_status (job_type, status)
);

CREATE TABLE IF NOT EXISTS job_locks (
  lock_key VARCHAR(120) PRIMARY KEY,
  owner_id VARCHAR(120) NOT NULL,
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  metadata_json JSON NULL,
  INDEX idx_job_locks_expires_at (expires_at)
);

CREATE TABLE IF NOT EXISTS job_attempts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  job_id BIGINT NOT NULL,
  attempt_no INT NOT NULL,
  status ENUM('running','succeeded','failed') NOT NULL DEFAULT 'running',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP NULL,
  logs_json JSON NULL,
  error_message TEXT NULL,
  UNIQUE KEY uq_job_attempt (job_id, attempt_no),
  INDEX idx_job_attempts_job_id (job_id)
);

CREATE TABLE IF NOT EXISTS data_quality_findings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(120) NULL,
  severity ENUM('info','warning','error','blocker') NOT NULL DEFAULT 'warning',
  rule_code VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open','accepted','fixed','ignored') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_quality_status_severity (status, severity),
  INDEX idx_quality_entity (entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS corpus_import_batches (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  batch_key VARCHAR(120) NOT NULL UNIQUE,
  source_repo VARCHAR(255) NOT NULL,
  source_commit VARCHAR(80) NULL,
  scope ENUM('preview_subset','full_corpus') NOT NULL,
  expected_min_entries INT DEFAULT 0,
  parsed_entries INT DEFAULT 0,
  imported_entries INT DEFAULT 0,
  failed_entries INT DEFAULT 0,
  status ENUM('planned','running','succeeded','failed','cancelled') DEFAULT 'planned',
  started_at TIMESTAMP NULL,
  finished_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_corpus_import_batches_scope_status (scope, status)
);

CREATE TABLE IF NOT EXISTS corpus_import_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  batch_key VARCHAR(120) NOT NULL,
  source_path VARCHAR(512) NOT NULL,
  source_row VARCHAR(120) NULL,
  dialect_code VARCHAR(10) NULL,
  form_hash CHAR(64) NOT NULL,
  audio_url VARCHAR(1024) NULL,
  source_phon_present BOOLEAN DEFAULT FALSE,
  action ENUM('inserted','updated','skipped_duplicate','failed') NOT NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_corpus_import_records_batch (batch_key),
  INDEX idx_corpus_import_records_hash (form_hash),
  INDEX idx_corpus_import_records_action (action)
);

CREATE TABLE IF NOT EXISTS main_site_contract_results (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  test_group VARCHAR(80) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  status ENUM('passed','failed','skipped') NOT NULL,
  http_status INT NULL,
  latency_ms INT NULL,
  response_excerpt TEXT NULL,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contract_results_group_checked (test_group, checked_at),
  INDEX idx_contract_results_status_checked (status, checked_at)
);

INSERT INTO runtime_config_flags (flag_key, flag_value, environment, description)
VALUES
  ('full_corpus_import_at_startup', JSON_EXTRACT('false', '$'), 'all', 'Must remain false; full corpus import runs as post-deploy/background job.'),
  ('public_vocabulary_max_limit', JSON_EXTRACT('100', '$'), 'all', 'Maximum public vocabulary page size.'),
  ('internal_bundle_max_vocabulary', JSON_EXTRACT('5000', '$'), 'all', 'Maximum vocabulary rows in internal bundle export.')
ON DUPLICATE KEY UPDATE flag_value = VALUES(flag_value), updated_at = CURRENT_TIMESTAMP;
