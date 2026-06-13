-- v46 reviewer queue, transactional writes, search observability, source governance, model registry and site experience
CREATE TABLE IF NOT EXISTS speech_reviewer_queue_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  queue_id VARCHAR(128) NOT NULL,
  asset_id VARCHAR(128) NOT NULL,
  workflow_id VARCHAR(128),
  queue_status VARCHAR(64) NOT NULL DEFAULT 'waiting_assignment',
  priority VARCHAR(16) NOT NULL DEFAULT 'P3',
  assigned_reviewer_id VARCHAR(190),
  assigned_by VARCHAR(190),
  assigned_at TIMESTAMP NULL,
  due_at TIMESTAMP NULL,
  role_scope_json JSON,
  evidence_required_json JSON,
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_reviewer_queue_v46_queue (queue_id),
  KEY idx_speech_reviewer_queue_v46_status (queue_status, priority, due_at),
  KEY idx_speech_reviewer_queue_v46_reviewer (assigned_reviewer_id, queue_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_review_evidence_attachments_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  attachment_id VARCHAR(128) NOT NULL,
  queue_id VARCHAR(128) NOT NULL,
  asset_id VARCHAR(128) NOT NULL,
  evidence_type VARCHAR(96) NOT NULL,
  storage_uri TEXT NOT NULL,
  sha256_hash VARCHAR(128) NOT NULL,
  uploaded_by VARCHAR(190) NOT NULL,
  scan_status VARCHAR(64) NOT NULL DEFAULT 'pending_scan',
  attachment_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_review_evidence_attachments_v46_attachment (attachment_id),
  KEY idx_speech_review_evidence_attachments_v46_queue (queue_id, evidence_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_review_sla_events_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_id VARCHAR(128) NOT NULL,
  queue_id VARCHAR(128) NOT NULL,
  asset_id VARCHAR(128) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  actor_id VARCHAR(190),
  event_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_review_sla_events_v46_event (event_id),
  KEY idx_speech_review_sla_events_v46_queue (queue_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_review_transactions_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  transaction_id VARCHAR(128) NOT NULL,
  queue_id VARCHAR(128) NOT NULL,
  asset_id VARCHAR(128) NOT NULL,
  reviewer_id VARCHAR(190) NOT NULL,
  decision VARCHAR(64) NOT NULL,
  decision_reason TEXT NOT NULL,
  request_hash VARCHAR(128) NOT NULL,
  idempotency_key VARCHAR(128),
  audit_json JSON,
  committed BOOLEAN NOT NULL DEFAULT FALSE,
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_review_transactions_v46_tx (transaction_id),
  UNIQUE KEY uq_speech_review_transactions_v46_idempotency (idempotency_key),
  KEY idx_speech_review_transactions_v46_asset (asset_id, decision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_alignment_transactions_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  transaction_id VARCHAR(128) NOT NULL,
  asset_id VARCHAR(128) NOT NULL,
  reviewer_id VARCHAR(190) NOT NULL,
  alignment_score DECIMAL(8,4) NOT NULL,
  transcript_hash VARCHAR(128) NOT NULL,
  request_hash VARCHAR(128) NOT NULL,
  alignment_json JSON,
  committed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_alignment_transactions_v46_tx (transaction_id),
  KEY idx_speech_alignment_transactions_v46_asset (asset_id, committed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS music_search_query_logs_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  log_id VARCHAR(128) NOT NULL,
  query_text VARCHAR(512) NOT NULL,
  normalized_query VARCHAR(512),
  result_count INT NOT NULL DEFAULT 0,
  latency_ms INT NOT NULL DEFAULT 0,
  mode VARCHAR(64),
  locale VARCHAR(32),
  referrer_path VARCHAR(512),
  ip_hash VARCHAR(128),
  facets_json JSON,
  suggestions_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_music_search_query_logs_v46_log (log_id),
  KEY idx_music_search_query_logs_v46_query (normalized_query, created_at),
  KEY idx_music_search_query_logs_v46_zero (result_count, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS music_search_zero_result_events_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_id VARCHAR(128) NOT NULL,
  query_text VARCHAR(512) NOT NULL,
  normalized_query VARCHAR(512),
  suggestions_json JSON,
  review_status VARCHAR(64) NOT NULL DEFAULT 'needs_query_analysis',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_music_search_zero_result_events_v46_event (event_id),
  KEY idx_music_search_zero_result_events_v46_query (normalized_query, review_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS music_search_facet_daily_stats_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  stat_date DATE NOT NULL,
  facet_name VARCHAR(96) NOT NULL,
  facet_value VARCHAR(190) NOT NULL,
  query_count INT NOT NULL DEFAULT 0,
  result_click_count INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_music_search_facet_daily_stats_v46_facet (stat_date, facet_name, facet_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS music_search_latency_snapshots_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  snapshot_id VARCHAR(128) NOT NULL,
  window_start TIMESTAMP NOT NULL,
  window_end TIMESTAMP NOT NULL,
  p50_ms INT NOT NULL DEFAULT 0,
  p95_ms INT NOT NULL DEFAULT 0,
  p99_ms INT NOT NULL DEFAULT 0,
  sample_count INT NOT NULL DEFAULT 0,
  snapshot_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_music_search_latency_snapshots_v46_snapshot (snapshot_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS authority_source_fetch_policies_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  adapter_id VARCHAR(128) NOT NULL,
  robots_txt_url TEXT,
  tos_review_status VARCHAR(64) NOT NULL DEFAULT 'needs_human_record',
  etag_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  if_modified_since_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  rate_limit_per_minute INT NOT NULL DEFAULT 8,
  policy_json JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_authority_source_fetch_policies_v46_adapter (adapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS authority_source_retry_queue_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  retry_id VARCHAR(128) NOT NULL,
  adapter_id VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'queued',
  attempt INT NOT NULL DEFAULT 0,
  next_run_at TIMESTAMP NULL,
  reason TEXT,
  last_error TEXT,
  retry_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_authority_source_retry_queue_v46_retry (retry_id),
  KEY idx_authority_source_retry_queue_v46_status (status, next_run_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS authority_source_candidate_merge_requests_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  merge_request_id VARCHAR(128) NOT NULL,
  adapter_id VARCHAR(128) NOT NULL,
  primary_candidate_id VARCHAR(128),
  duplicate_candidate_ids_json JSON,
  merge_status VARCHAR(64) NOT NULL DEFAULT 'pending_review',
  reviewer_id VARCHAR(190),
  decision_reason TEXT,
  merge_json JSON,
  public_auto_release BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_authority_source_candidate_merge_requests_v46_merge (merge_request_id),
  KEY idx_authority_source_candidate_merge_requests_v46_status (merge_status, adapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_model_experiment_registry_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  experiment_id VARCHAR(128) NOT NULL,
  model_type VARCHAR(32) NOT NULL,
  candidate_version VARCHAR(128) NOT NULL,
  baseline_version VARCHAR(128),
  release_gate VARCHAR(128) NOT NULL DEFAULT 'blocked',
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  registry_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_model_experiment_registry_v46_exp (experiment_id),
  KEY idx_speech_model_experiment_registry_v46_type (model_type, release_gate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_dataset_lineage_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  lineage_id VARCHAR(128) NOT NULL,
  experiment_id VARCHAR(128) NOT NULL,
  train_count INT NOT NULL DEFAULT 0,
  dev_count INT NOT NULL DEFAULT 0,
  test_count INT NOT NULL DEFAULT 0,
  blocked_count INT NOT NULL DEFAULT 0,
  lineage_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_dataset_lineage_v46_lineage (lineage_id),
  KEY idx_speech_dataset_lineage_v46_exp (experiment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_model_metric_trends_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  trend_id VARCHAR(128) NOT NULL,
  experiment_id VARCHAR(128) NOT NULL,
  metric_name VARCHAR(64) NOT NULL,
  metric_value DECIMAL(10,4),
  sample_count INT NOT NULL DEFAULT 0,
  trend_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_model_metric_trends_v46_trend (trend_id),
  KEY idx_speech_model_metric_trends_v46_metric (metric_name, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_model_release_decisions_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  decision_id VARCHAR(128) NOT NULL,
  experiment_id VARCHAR(128) NOT NULL,
  reviewer_id VARCHAR(190) NOT NULL,
  decision VARCHAR(64) NOT NULL,
  decision_reason TEXT NOT NULL,
  request_hash VARCHAR(128) NOT NULL,
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  decision_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_model_release_decisions_v46_decision (decision_id),
  KEY idx_speech_model_release_decisions_v46_exp (experiment_id, decision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS main_site_experience_artifacts_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  artifact_id VARCHAR(128) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  artifact_type VARCHAR(64) NOT NULL,
  contrast_passed BOOLEAN NOT NULL DEFAULT TRUE,
  og_guard_passed BOOLEAN NOT NULL DEFAULT TRUE,
  artifact_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_main_site_experience_artifacts_v46_artifact (artifact_id),
  KEY idx_main_site_experience_artifacts_v46_route (route_path, artifact_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS vps_preflight_reports_v46 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_id VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'not_run',
  checks_passed INT NOT NULL DEFAULT 0,
  checks_failed INT NOT NULL DEFAULT 0,
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_vps_preflight_reports_v46_report (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
