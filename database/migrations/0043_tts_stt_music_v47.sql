-- v47 operational review UI, MySQL transaction integration tests, wired search observability, authority live adapters, model governance and site polish
CREATE TABLE IF NOT EXISTS speech_review_action_forms_v47 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  form_id VARCHAR(128) NOT NULL,
  action_type VARCHAR(64) NOT NULL,
  required_fields_json JSON,
  role_policy_json JSON,
  hmac_nonce_required BOOLEAN NOT NULL DEFAULT TRUE,
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_review_action_forms_v47_form (form_id),
  KEY idx_speech_review_action_forms_v47_action (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_review_hmac_nonces_v47 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nonce_id VARCHAR(128) NOT NULL,
  nonce_hash VARCHAR(128) NOT NULL,
  issued_to VARCHAR(190) NOT NULL,
  purpose VARCHAR(96) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_review_hmac_nonces_v47_nonce (nonce_id),
  KEY idx_speech_review_hmac_nonces_v47_user (issued_to, purpose, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_review_action_audit_v47 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  action_id VARCHAR(128) NOT NULL,
  queue_id VARCHAR(128),
  asset_id VARCHAR(128),
  action_type VARCHAR(64) NOT NULL,
  actor_id VARCHAR(190) NOT NULL,
  request_hash VARCHAR(128) NOT NULL,
  idempotency_key VARCHAR(128),
  action_json JSON,
  committed BOOLEAN NOT NULL DEFAULT FALSE,
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_review_action_audit_v47_action (action_id),
  UNIQUE KEY uq_speech_review_action_audit_v47_idempotency (idempotency_key),
  KEY idx_speech_review_action_audit_v47_queue (queue_id, asset_id, action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS mysql_transaction_integration_test_runs_v47 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(128) NOT NULL,
  case_id VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'not_run',
  expected_result TEXT,
  actual_result TEXT,
  run_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_mysql_transaction_integration_test_runs_v47_run (run_id),
  KEY idx_mysql_transaction_integration_test_runs_v47_case (case_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS music_search_query_logs_v47 (
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
  facet_counts_json JSON,
  suggestions_json JSON,
  source_route VARCHAR(190) NOT NULL DEFAULT '/api/public/search/music/v43',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_music_search_query_logs_v47_log (log_id),
  KEY idx_music_search_query_logs_v47_query (normalized_query, created_at),
  KEY idx_music_search_query_logs_v47_zero (result_count, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS music_search_weekly_zero_result_reports_v47 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_id VARCHAR(128) NOT NULL,
  week_start DATE NOT NULL,
  normalized_query VARCHAR(512) NOT NULL,
  zero_result_count INT NOT NULL DEFAULT 0,
  suggestions_json JSON,
  review_status VARCHAR(64) NOT NULL DEFAULT 'needs_search_quality_review',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_music_search_weekly_zero_result_reports_v47_report (report_id),
  KEY idx_music_search_weekly_zero_result_reports_v47_week (week_start, review_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS music_search_alert_rules_v47 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rule_id VARCHAR(128) NOT NULL,
  metric_name VARCHAR(96) NOT NULL,
  operator VARCHAR(16) NOT NULL,
  threshold_value DECIMAL(12,4) NOT NULL,
  severity VARCHAR(32) NOT NULL DEFAULT 'warning',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  rule_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_music_search_alert_rules_v47_rule (rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS authority_source_fetch_runs_v47 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  fetch_run_id VARCHAR(128) NOT NULL,
  adapter_id VARCHAR(128) NOT NULL,
  fetch_mode VARCHAR(96) NOT NULL DEFAULT 'metadata_only_candidate_snapshot',
  robots_tos_status VARCHAR(64) NOT NULL DEFAULT 'needs_human_record',
  http_status INT,
  etag VARCHAR(255),
  last_modified VARCHAR(255),
  candidate_count INT NOT NULL DEFAULT 0,
  run_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_authority_source_fetch_runs_v47_run (fetch_run_id),
  KEY idx_authority_source_fetch_runs_v47_adapter (adapter_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS authority_source_candidate_snapshots_v47 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_id VARCHAR(128) NOT NULL,
  fetch_run_id VARCHAR(128) NOT NULL,
  adapter_id VARCHAR(128) NOT NULL,
  source_title VARCHAR(512),
  source_url TEXT,
  summary_excerpt TEXT,
  rights_statement TEXT,
  review_status VARCHAR(64) NOT NULL DEFAULT 'pending_metadata_review',
  public_auto_release BOOLEAN NOT NULL DEFAULT FALSE,
  candidate_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_authority_source_candidate_snapshots_v47_candidate (candidate_id),
  KEY idx_authority_source_candidate_snapshots_v47_status (review_status, adapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_model_governance_reports_v47 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_id VARCHAR(128) NOT NULL,
  experiment_id VARCHAR(128) NOT NULL,
  report_type VARCHAR(96) NOT NULL,
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_model_governance_reports_v47_report (report_id),
  KEY idx_speech_model_governance_reports_v47_exp (experiment_id, report_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS main_site_polish_validations_v47 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  validation_id VARCHAR(128) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  check_name VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'not_run',
  validation_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_main_site_polish_validations_v47_validation (validation_id),
  KEY idx_main_site_polish_validations_v47_route (route_path, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS vps_preflight_reports_v47 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_id VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'not_run',
  checks_passed INT NOT NULL DEFAULT 0,
  checks_failed INT NOT NULL DEFAULT 0,
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_vps_preflight_reports_v47_report (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
