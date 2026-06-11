-- v11 Data Delivery Governance migration
-- API versioning, scoped clients, export artifacts, sync replay, retry/dead-letter, and data quality reports.

CREATE TABLE IF NOT EXISTS api_versions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  version_key VARCHAR(64) NOT NULL UNIQUE,
  status VARCHAR(32) NOT NULL DEFAULT 'stable',
  released_at DATETIME NULL,
  deprecated_at DATETIME NULL,
  sunset_at DATETIME NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_client_scopes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  scope_key VARCHAR(128) NOT NULL UNIQUE,
  description TEXT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_client_scope_grants (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  api_client_id BIGINT NOT NULL,
  scope_key VARCHAR(128) NOT NULL,
  granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  UNIQUE KEY uq_api_client_scope (api_client_id, scope_key)
);

CREATE TABLE IF NOT EXISTS data_export_jobs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  job_key VARCHAR(128) NOT NULL UNIQUE,
  bundle_type VARCHAR(64) NOT NULL,
  export_format VARCHAR(32) NOT NULL DEFAULT 'json',
  status VARCHAR(32) NOT NULL DEFAULT 'queued',
  requested_by VARCHAR(128) NULL,
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  error_message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_export_artifact_files (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  export_job_id BIGINT NOT NULL,
  artifact_key VARCHAR(255) NOT NULL,
  storage_url TEXT NULL,
  local_path TEXT NULL,
  sha256 VARCHAR(128) NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  row_count BIGINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_artifact_key (artifact_key)
);

CREATE TABLE IF NOT EXISTS sync_replay_runs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  replay_key VARCHAR(128) NOT NULL UNIQUE,
  api_client_id BIGINT NULL,
  since_cursor TEXT NULL,
  since_time DATETIME NULL,
  until_time DATETIME NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'queued',
  event_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS sync_replay_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  replay_run_id BIGINT NOT NULL,
  event_type VARCHAR(128) NOT NULL,
  entity_type VARCHAR(64) NOT NULL,
  entity_id VARCHAR(128) NOT NULL,
  payload_json JSON NULL,
  public_safe BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_replay_run (replay_run_id),
  KEY idx_replay_entity (entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS job_dead_letters (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_job_id VARCHAR(128) NOT NULL,
  job_type VARCHAR(128) NOT NULL,
  failure_code VARCHAR(128) NOT NULL,
  failure_message TEXT NULL,
  payload_json JSON NULL,
  retryable BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS data_quality_reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_key VARCHAR(128) NOT NULL UNIQUE,
  report_type VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'generated',
  total_findings INT NOT NULL DEFAULT 0,
  blocker_count INT NOT NULL DEFAULT 0,
  warning_count INT NOT NULL DEFAULT 0,
  artifact_url TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_quality_report_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_id BIGINT NOT NULL,
  finding_key VARCHAR(128) NOT NULL,
  severity VARCHAR(32) NOT NULL,
  entity_type VARCHAR(64) NULL,
  entity_id VARCHAR(128) NULL,
  message TEXT NOT NULL,
  source_path TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_quality_report (report_id),
  KEY idx_quality_severity (severity)
);

CREATE TABLE IF NOT EXISTS public_release_channels (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  channel_key VARCHAR(64) NOT NULL UNIQUE,
  description TEXT NULL,
  min_review_status VARCHAR(64) NOT NULL DEFAULT 'approved',
  min_verification_status VARCHAR(64) NOT NULL DEFAULT 'verified_public',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_publish_batches (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  batch_key VARCHAR(128) NOT NULL UNIQUE,
  channel_key VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  entity_count INT NOT NULL DEFAULT 0,
  blocker_count INT NOT NULL DEFAULT 0,
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cache_invalidation_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_key VARCHAR(128) NOT NULL UNIQUE,
  target VARCHAR(128) NOT NULL,
  reason TEXT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'queued',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL
);

INSERT IGNORE INTO api_versions (version_key, status, released_at, notes)
VALUES ('2026-06-11', 'stable', CURRENT_TIMESTAMP, 'Initial stable public/internal main-site API contract.');

INSERT IGNORE INTO api_client_scopes (scope_key, description, is_internal) VALUES
('knowledge:read', 'Read public-safe knowledge bundle and delta data', TRUE),
('vocabulary:read', 'Read approved vocabulary/audio corpus entries', TRUE),
('sync:replay', 'Request replay of missed main-site sync events', TRUE),
('export:read', 'Read latest generated export artifacts', TRUE),
('export:write', 'Enqueue export bundle generation jobs', TRUE),
('jobs:write', 'Enqueue internal background jobs such as full corpus import', TRUE);

INSERT IGNORE INTO public_release_channels (channel_key, description, min_review_status, min_verification_status) VALUES
('preview', 'Preview data for development and smoke tests; includes 80-entry preview vocabulary subset.', 'approved', 'verified_public'),
('public', 'Public website content only.', 'approved', 'verified_public'),
('full_corpus_candidate', 'Full corpus import before final human QA.', 'review_required', 'source_verified'),
('full_corpus_verified', 'Full corpus import after QA and licensing review.', 'approved', 'verified_public');
