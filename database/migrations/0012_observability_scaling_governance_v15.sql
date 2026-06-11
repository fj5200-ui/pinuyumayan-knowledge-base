-- v15 Observability, SLA, corpus reconciliation and contract governance.
-- Target: MySQL 8 / TiDB-compatible DDL.

CREATE TABLE IF NOT EXISTS api_contract_test_runs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(64) NOT NULL UNIQUE,
  suite_name VARCHAR(128) NOT NULL,
  target_base_url VARCHAR(512) NOT NULL,
  status ENUM('pending','running','passed','failed','cancelled') NOT NULL DEFAULT 'pending',
  total_cases INT NOT NULL DEFAULT 0,
  passed_cases INT NOT NULL DEFAULT 0,
  failed_cases INT NOT NULL DEFAULT 0,
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contract_runs_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS api_contract_test_results (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(64) NOT NULL,
  case_id VARCHAR(128) NOT NULL,
  method VARCHAR(12) NOT NULL,
  path_template VARCHAR(255) NOT NULL,
  expected_status INT NOT NULL,
  actual_status INT NULL,
  status ENUM('passed','failed','skipped') NOT NULL,
  response_ms INT NULL,
  error_message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contract_results_run (run_id),
  INDEX idx_contract_results_status (status)
);

CREATE TABLE IF NOT EXISTS endpoint_slo_results (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  endpoint_key VARCHAR(128) NOT NULL,
  window_start DATETIME NOT NULL,
  window_end DATETIME NOT NULL,
  total_requests INT NOT NULL DEFAULT 0,
  success_requests INT NOT NULL DEFAULT 0,
  error_requests INT NOT NULL DEFAULT 0,
  p50_ms INT NULL,
  p95_ms INT NULL,
  p99_ms INT NULL,
  availability_pct DECIMAL(6,3) NULL,
  slo_status ENUM('pass','warn','breach') NOT NULL DEFAULT 'pass',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_endpoint_slo_window (endpoint_key, window_start, window_end),
  INDEX idx_endpoint_slo_status (slo_status)
);

CREATE TABLE IF NOT EXISTS public_payload_snapshots_v15 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  snapshot_key VARCHAR(128) NOT NULL,
  release_channel VARCHAR(64) NOT NULL DEFAULT 'public',
  payload_type ENUM('bootstrap','vocabulary','search_export','content_collection','full_bundle') NOT NULL,
  artifact_url VARCHAR(1024) NULL,
  sha256 CHAR(64) NOT NULL,
  etag VARCHAR(128) NOT NULL,
  row_count INT NOT NULL DEFAULT 0,
  byte_size BIGINT NOT NULL DEFAULT 0,
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  UNIQUE KEY uq_payload_snapshot (snapshot_key, release_channel, payload_type, sha256),
  INDEX idx_payload_snapshots_channel_type (release_channel, payload_type)
);

CREATE TABLE IF NOT EXISTS knowledge_delivery_incidents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  incident_key VARCHAR(128) NOT NULL UNIQUE,
  severity ENUM('sev1','sev2','sev3','sev4') NOT NULL DEFAULT 'sev3',
  status ENUM('open','mitigating','resolved','postmortem') NOT NULL DEFAULT 'open',
  title VARCHAR(255) NOT NULL,
  affected_system VARCHAR(128) NOT NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  summary TEXT NULL,
  mitigation TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_incidents_status_severity (status, severity)
);

CREATE TABLE IF NOT EXISTS corpus_ingest_watermarks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_id VARCHAR(128) NOT NULL,
  source_path VARCHAR(512) NOT NULL,
  dialect_code VARCHAR(16) NOT NULL,
  last_source_sha VARCHAR(64) NULL,
  last_row_count INT NOT NULL DEFAULT 0,
  last_audio_count INT NOT NULL DEFAULT 0,
  last_import_run_id VARCHAR(64) NULL,
  last_imported_at DATETIME NULL,
  status ENUM('pending','imported','changed','failed','ignored') NOT NULL DEFAULT 'pending',
  UNIQUE KEY uq_corpus_watermark (source_id, source_path),
  INDEX idx_corpus_watermark_status (status)
);

CREATE TABLE IF NOT EXISTS corpus_reconciliation_runs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(64) NOT NULL UNIQUE,
  import_run_id VARCHAR(64) NULL,
  expected_sources INT NOT NULL DEFAULT 0,
  seen_sources INT NOT NULL DEFAULT 0,
  expected_min_entries INT NOT NULL DEFAULT 1000,
  actual_entries INT NOT NULL DEFAULT 0,
  entries_with_audio INT NOT NULL DEFAULT 0,
  entries_with_source_phon INT NOT NULL DEFAULT 0,
  duplicate_candidates INT NOT NULL DEFAULT 0,
  license_blocked_entries INT NOT NULL DEFAULT 0,
  status ENUM('pending','running','passed','failed','needs_review') NOT NULL DEFAULT 'pending',
  report_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME NULL,
  INDEX idx_reconciliation_status (status)
);

CREATE TABLE IF NOT EXISTS corpus_reconciliation_findings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(64) NOT NULL,
  finding_type ENUM('missing_source','row_count_mismatch','missing_audio','missing_source_phon','duplicate','license_risk','dialect_mismatch','parse_error') NOT NULL,
  severity ENUM('info','warning','error','blocker') NOT NULL DEFAULT 'warning',
  source_path VARCHAR(512) NULL,
  corpus_entry_id VARCHAR(128) NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reconciliation_findings_run (run_id),
  INDEX idx_reconciliation_findings_severity (severity)
);

CREATE TABLE IF NOT EXISTS search_index_versions_v15 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  version_key VARCHAR(128) NOT NULL UNIQUE,
  release_channel VARCHAR(64) NOT NULL,
  document_count INT NOT NULL DEFAULT 0,
  vocabulary_count INT NOT NULL DEFAULT 0,
  fact_count INT NOT NULL DEFAULT 0,
  content_count INT NOT NULL DEFAULT 0,
  synonym_version VARCHAR(64) NULL,
  artifact_url VARCHAR(1024) NULL,
  sha256 CHAR(64) NULL,
  status ENUM('building','ready','failed','superseded') NOT NULL DEFAULT 'building',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  promoted_at DATETIME NULL,
  INDEX idx_search_versions_channel_status (release_channel, status)
);

CREATE TABLE IF NOT EXISTS search_relevance_evaluations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  eval_id VARCHAR(64) NOT NULL UNIQUE,
  query_set_key VARCHAR(128) NOT NULL,
  index_version_key VARCHAR(128) NOT NULL,
  query_count INT NOT NULL DEFAULT 0,
  pass_count INT NOT NULL DEFAULT 0,
  fail_count INT NOT NULL DEFAULT 0,
  average_score DECIMAL(8,4) NULL,
  status ENUM('pending','passed','failed','needs_review') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_eval_status (status)
);

CREATE TABLE IF NOT EXISTS admin_permission_grants_v15 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_user_id BIGINT NOT NULL,
  permission_code VARCHAR(128) NOT NULL,
  scope_type ENUM('global','module','community','content','import_run','release_channel') NOT NULL DEFAULT 'global',
  scope_value VARCHAR(128) NULL,
  granted_by BIGINT NULL,
  reason VARCHAR(255) NULL,
  expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admin_permission_scope (admin_user_id, permission_code, scope_type, scope_value),
  INDEX idx_admin_permission_code (permission_code)
);

CREATE TABLE IF NOT EXISTS security_audit_events_v15 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_key VARCHAR(128) NOT NULL,
  actor_type ENUM('admin','api_client','system','worker') NOT NULL,
  actor_id VARCHAR(128) NULL,
  action VARCHAR(128) NOT NULL,
  target_type VARCHAR(128) NULL,
  target_id VARCHAR(128) NULL,
  risk_level ENUM('low','medium','high','critical') NOT NULL DEFAULT 'low',
  ip_hash VARCHAR(128) NULL,
  user_agent_hash VARCHAR(128) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_security_audit_action (action, created_at),
  INDEX idx_security_audit_risk (risk_level)
);
