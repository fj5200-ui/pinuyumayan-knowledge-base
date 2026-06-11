-- 0004 production operations and main-site synchronization hardening
-- Purpose: deployment locks, job runs, API key rotation metadata, sync snapshots, and webhook delivery ledger.

CREATE TABLE IF NOT EXISTS ops_deploy_locks (
  lock_name VARCHAR(120) PRIMARY KEY,
  owner VARCHAR(160) NOT NULL,
  acquired_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  metadata_json JSON NULL
);

CREATE TABLE IF NOT EXISTS ops_migration_runs (
  id VARCHAR(120) PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL,
  checksum VARCHAR(128) NOT NULL,
  status ENUM('started','success','failed','rolled_back') NOT NULL DEFAULT 'started',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME NULL,
  error_message TEXT NULL,
  UNIQUE KEY uq_ops_migration_name (migration_name)
);

CREATE TABLE IF NOT EXISTS ops_job_runs (
  id VARCHAR(120) PRIMARY KEY,
  job_name VARCHAR(160) NOT NULL,
  job_type ENUM('preview_bootstrap','full_corpus_import','audio_mirror','search_reindex','backup','main_site_sync') NOT NULL,
  status ENUM('queued','running','success','failed','cancelled') NOT NULL DEFAULT 'queued',
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  counters_json JSON NULL,
  error_message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ops_job_type_status (job_type, status),
  INDEX idx_ops_job_created (created_at)
);

CREATE TABLE IF NOT EXISTS api_client_key_rotations (
  id VARCHAR(120) PRIMARY KEY,
  api_client_id VARCHAR(120) NOT NULL,
  key_hint VARCHAR(32) NOT NULL,
  rotation_status ENUM('planned','active','retired','revoked') NOT NULL DEFAULT 'planned',
  valid_from DATETIME NULL,
  valid_until DATETIME NULL,
  rotated_by VARCHAR(160) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_api_key_rotation_client (api_client_id, rotation_status)
);

CREATE TABLE IF NOT EXISTS api_rate_limit_policies (
  id VARCHAR(120) PRIMARY KEY,
  route_pattern VARCHAR(255) NOT NULL,
  audience ENUM('public','internal','admin') NOT NULL DEFAULT 'public',
  requests_per_minute INT NOT NULL DEFAULT 120,
  burst INT NOT NULL DEFAULT 30,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rate_limit_route_audience (route_pattern, audience)
);

CREATE TABLE IF NOT EXISTS webhook_delivery_logs (
  id VARCHAR(120) PRIMARY KEY,
  event_type VARCHAR(120) NOT NULL,
  target_url TEXT NOT NULL,
  status ENUM('queued','sent','failed','dead_letter') NOT NULL DEFAULT 'queued',
  attempts INT NOT NULL DEFAULT 0,
  payload_json JSON NOT NULL,
  last_error TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_webhook_event_status (event_type, status)
);

CREATE TABLE IF NOT EXISTS main_site_sync_snapshots (
  id VARCHAR(120) PRIMARY KEY,
  snapshot_type ENUM('bootstrap','bundle','delta','search_index') NOT NULL,
  cursor_value VARCHAR(160) NULL,
  item_count INT NOT NULL DEFAULT 0,
  checksum VARCHAR(128) NOT NULL,
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  payload_uri TEXT NULL,
  metadata_json JSON NULL,
  INDEX idx_main_site_snapshot_type (snapshot_type, generated_at)
);

INSERT IGNORE INTO api_rate_limit_policies (id, route_pattern, audience, requests_per_minute, burst)
VALUES
  ('rl_public_knowledge', '/api/public/knowledge/*', 'public', 120, 30),
  ('rl_internal_main_site', '/api/internal/main-site/*', 'internal', 600, 60),
  ('rl_health', '/health', 'public', 600, 60);
