-- v12 Multi-site delivery governance and release orchestration.
-- MySQL/TiDB compatible DDL. Use after 0001-0007.

CREATE TABLE IF NOT EXISTS release_channels (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  channel_key VARCHAR(80) NOT NULL UNIQUE,
  display_name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  is_public TINYINT(1) NOT NULL DEFAULT 0,
  requires_review TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS release_channel_memberships (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  channel_key VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(160) NOT NULL,
  status VARCHAR(60) NOT NULL DEFAULT 'candidate',
  release_batch_id VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_release_entity_channel (channel_key, entity_type, entity_id),
  KEY idx_release_membership_status (channel_key, status)
);

CREATE TABLE IF NOT EXISTS release_promotion_rules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  from_channel VARCHAR(80) NOT NULL,
  to_channel VARCHAR(80) NOT NULL,
  required_checks JSON NOT NULL,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS client_release_channel_grants (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  api_client_key VARCHAR(120) NOT NULL,
  channel_key VARCHAR(80) NOT NULL,
  can_read TINYINT(1) NOT NULL DEFAULT 1,
  can_write TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_client_channel_grant (api_client_key, channel_key)
);

CREATE TABLE IF NOT EXISTS data_lineage_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(160) NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  source_id VARCHAR(160) NULL,
  source_path TEXT NULL,
  source_row VARCHAR(120) NULL,
  source_hash VARCHAR(128) NULL,
  import_run_id VARCHAR(120) NULL,
  release_batch_id VARCHAR(120) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_lineage_entity (entity_type, entity_id),
  KEY idx_lineage_import (import_run_id),
  KEY idx_lineage_release (release_batch_id)
);

CREATE TABLE IF NOT EXISTS data_quality_gate_runs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  gate_key VARCHAR(120) NOT NULL,
  release_batch_id VARCHAR(120) NULL,
  import_run_id VARCHAR(120) NULL,
  status VARCHAR(40) NOT NULL,
  total_checked INT NOT NULL DEFAULT 0,
  blockers INT NOT NULL DEFAULT 0,
  warnings INT NOT NULL DEFAULT 0,
  report_json JSON NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME NULL,
  KEY idx_quality_gate_batch (release_batch_id),
  KEY idx_quality_gate_status (status)
);

CREATE TABLE IF NOT EXISTS search_export_runs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  export_key VARCHAR(120) NOT NULL,
  target_engine VARCHAR(80) NOT NULL,
  release_channel VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'queued',
  document_count INT NOT NULL DEFAULT 0,
  artifact_path TEXT NULL,
  artifact_sha256 VARCHAR(128) NULL,
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_search_export_status (status, release_channel)
);

CREATE TABLE IF NOT EXISTS main_site_sync_ledger (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_key VARCHAR(120) NOT NULL,
  sync_mode VARCHAR(60) NOT NULL,
  cursor_before VARCHAR(160) NULL,
  cursor_after VARCHAR(160) NULL,
  artifact_id VARCHAR(160) NULL,
  status VARCHAR(40) NOT NULL,
  pulled_records INT NOT NULL DEFAULT 0,
  request_id VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_sync_ledger_client (client_key, created_at),
  KEY idx_sync_ledger_status (status)
);

CREATE TABLE IF NOT EXISTS api_slo_windows (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  window_start DATETIME NOT NULL,
  window_end DATETIME NOT NULL,
  metric_key VARCHAR(120) NOT NULL,
  target_value DECIMAL(10,4) NOT NULL,
  actual_value DECIMAL(10,4) NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  metadata JSON NULL,
  UNIQUE KEY uq_slo_metric_window (metric_key, window_start, window_end)
);

CREATE TABLE IF NOT EXISTS governance_dashboard_snapshots (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  snapshot_key VARCHAR(120) NOT NULL,
  payload JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_governance_snapshot_key (snapshot_key, created_at)
);

CREATE TABLE IF NOT EXISTS data_retention_runs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  policy_key VARCHAR(120) NOT NULL,
  table_name VARCHAR(120) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'queued',
  rows_deleted INT NOT NULL DEFAULT 0,
  rows_archived INT NOT NULL DEFAULT 0,
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public_api_materialized_payloads (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  payload_key VARCHAR(160) NOT NULL UNIQUE,
  release_channel VARCHAR(80) NOT NULL,
  etag VARCHAR(160) NOT NULL,
  payload_json JSON NOT NULL,
  expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_public_payload_channel (release_channel, updated_at)
);

INSERT IGNORE INTO release_channels (channel_key, display_name, description, is_public, requires_review) VALUES
  ('public', 'Public', 'Approved public knowledge for the main site and public apps.', 1, 1),
  ('preview', 'Preview', 'Approved but pre-release data for staging preview.', 0, 1),
  ('full_corpus_candidate', 'Full corpus candidate', 'Imported corpus rows awaiting QA and license review.', 0, 1),
  ('full_corpus_verified', 'Full corpus verified', 'Corpus rows approved for public learning use.', 1, 1),
  ('internal_review', 'Internal review', 'Internal review and curation queue.', 0, 0);

