-- 0005_delivery_runtime.sql
-- Main-site delivery runtime, cache/revalidation, OpenAPI discovery, webhook outbox, and corpus import checkpoints.

CREATE TABLE IF NOT EXISTS api_cache_entries (
  id VARCHAR(120) PRIMARY KEY,
  cache_key VARCHAR(512) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  request_hash VARCHAR(128) NOT NULL,
  payload_json JSON NOT NULL,
  visibility_scope ENUM('public','internal') NOT NULL DEFAULT 'public',
  expires_at DATETIME NOT NULL,
  stale_until DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_api_cache_key (cache_key),
  KEY idx_api_cache_expiry (expires_at)
);

CREATE TABLE IF NOT EXISTS api_rate_limit_events (
  id VARCHAR(120) PRIMARY KEY,
  client_key VARCHAR(160) NULL,
  ip_hash VARCHAR(128) NULL,
  route_key VARCHAR(160) NOT NULL,
  window_start DATETIME NOT NULL,
  request_count INT NOT NULL DEFAULT 1,
  blocked_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_rate_route_window (route_key, window_start),
  KEY idx_rate_client_window (client_key, window_start)
);

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id VARCHAR(120) PRIMARY KEY,
  client_id VARCHAR(120) NOT NULL,
  target_url TEXT NOT NULL,
  event_filter_json JSON NOT NULL,
  signing_secret_ref VARCHAR(255) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_success_at DATETIME NULL,
  last_failure_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_webhook_client (client_id)
);

CREATE TABLE IF NOT EXISTS webhook_outbox_events (
  id VARCHAR(120) PRIMARY KEY,
  event_type VARCHAR(160) NOT NULL,
  aggregate_type VARCHAR(120) NOT NULL,
  aggregate_id VARCHAR(160) NOT NULL,
  payload_json JSON NOT NULL,
  delivery_status ENUM('pending','delivering','delivered','failed','dead_letter') NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  next_attempt_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivered_at DATETIME NULL,
  KEY idx_outbox_status_next (delivery_status, next_attempt_at),
  KEY idx_outbox_aggregate (aggregate_type, aggregate_id)
);

CREATE TABLE IF NOT EXISTS search_reindex_queue (
  id VARCHAR(120) PRIMARY KEY,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(160) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  priority ENUM('p0','p1','p2','p3') NOT NULL DEFAULT 'p2',
  status ENUM('queued','running','completed','failed','skipped') NOT NULL DEFAULT 'queued',
  error_message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  KEY idx_reindex_status_priority (status, priority, created_at)
);

CREATE TABLE IF NOT EXISTS corpus_import_file_manifest (
  id VARCHAR(160) PRIMARY KEY,
  source_id VARCHAR(120) NOT NULL,
  source_path TEXT NOT NULL,
  source_format ENUM('csv','xml','unknown') NOT NULL DEFAULT 'unknown',
  dialect_code VARCHAR(10) NULL,
  expected_min_rows INT NOT NULL DEFAULT 0,
  discovered_rows INT NOT NULL DEFAULT 0,
  imported_rows INT NOT NULL DEFAULT 0,
  rejected_rows INT NOT NULL DEFAULT 0,
  has_audio BOOLEAN NOT NULL DEFAULT FALSE,
  has_source_phon BOOLEAN NOT NULL DEFAULT FALSE,
  checksum_sha256 VARCHAR(128) NULL,
  last_import_run_id VARCHAR(120) NULL,
  status ENUM('planned','downloaded','parsed','imported','failed','skipped') NOT NULL DEFAULT 'planned',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_manifest_dialect_format (dialect_code, source_format),
  KEY idx_manifest_status (status)
);

CREATE TABLE IF NOT EXISTS corpus_import_checkpoints (
  id VARCHAR(120) PRIMARY KEY,
  import_run_id VARCHAR(120) NOT NULL,
  checkpoint_key VARCHAR(160) NOT NULL,
  checkpoint_value TEXT NOT NULL,
  rows_seen INT NOT NULL DEFAULT 0,
  rows_written INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_import_checkpoint (import_run_id, checkpoint_key)
);

CREATE TABLE IF NOT EXISTS main_site_pull_tokens (
  id VARCHAR(120) PRIMARY KEY,
  client_id VARCHAR(120) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  scope_json JSON NOT NULL,
  expires_at DATETIME NULL,
  revoked_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pull_token_hash (token_hash),
  KEY idx_pull_token_client (client_id)
);

CREATE TABLE IF NOT EXISTS data_export_artifacts (
  id VARCHAR(120) PRIMARY KEY,
  artifact_type ENUM('main_site_bundle','vocabulary_export','search_index','audit_report','backup_manifest') NOT NULL,
  storage_url TEXT NULL,
  local_path TEXT NULL,
  checksum_sha256 VARCHAR(128) NULL,
  row_count INT NOT NULL DEFAULT 0,
  metadata_json JSON NULL,
  created_by VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  KEY idx_export_type_created (artifact_type, created_at)
);
