-- v48 VPS DB validation, complete review workbench, search analytics, authority merge, model visualization, site visual completion
CREATE TABLE IF NOT EXISTS vps_db_validation_reports_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_id VARCHAR(128) NOT NULL,
  run_mode VARCHAR(64) NOT NULL DEFAULT 'contract_only',
  status VARCHAR(64) NOT NULL DEFAULT 'not_run',
  checks_total INT NOT NULL DEFAULT 0,
  checks_passed INT NOT NULL DEFAULT 0,
  checks_failed INT NOT NULL DEFAULT 0,
  migration_checksum VARCHAR(128),
  seed_checksum VARCHAR(128),
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_vps_db_validation_reports_v48_report (report_id),
  KEY idx_vps_db_validation_reports_v48_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS vps_db_validation_check_results_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  result_id VARCHAR(128) NOT NULL,
  report_id VARCHAR(128) NOT NULL,
  check_id VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'not_run',
  expected_result TEXT,
  actual_result TEXT,
  check_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_vps_db_validation_check_results_v48_result (result_id),
  KEY idx_vps_db_validation_check_results_v48_report (report_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_review_workbench_views_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  view_id VARCHAR(128) NOT NULL,
  role_name VARCHAR(96) NOT NULL,
  filter_json JSON,
  visible_columns_json JSON,
  batch_actions_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_review_workbench_views_v48_view (view_id),
  KEY idx_speech_review_workbench_views_v48_role (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_review_bulk_actions_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  bulk_action_id VARCHAR(128) NOT NULL,
  action_type VARCHAR(64) NOT NULL,
  actor_id VARCHAR(190) NOT NULL,
  selected_count INT NOT NULL DEFAULT 0,
  success_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  request_hash VARCHAR(128) NOT NULL,
  idempotency_key VARCHAR(128),
  action_json JSON,
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_review_bulk_actions_v48_action (bulk_action_id),
  UNIQUE KEY uq_speech_review_bulk_actions_v48_idem (idempotency_key),
  KEY idx_speech_review_bulk_actions_v48_actor (actor_id, action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_review_history_events_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_id VARCHAR(128) NOT NULL,
  queue_id VARCHAR(128) NOT NULL,
  asset_id VARCHAR(128) NOT NULL,
  actor_id VARCHAR(190) NOT NULL,
  event_type VARCHAR(96) NOT NULL,
  request_hash VARCHAR(128) NOT NULL,
  event_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_review_history_events_v48_event (event_id),
  KEY idx_speech_review_history_events_v48_asset (queue_id, asset_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS music_search_daily_metrics_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  metric_date DATE NOT NULL,
  query_count INT NOT NULL DEFAULT 0,
  zero_result_count INT NOT NULL DEFAULT 0,
  zero_result_rate DECIMAL(8,4) NOT NULL DEFAULT 0,
  p95_latency_ms INT NOT NULL DEFAULT 0,
  p99_latency_ms INT NOT NULL DEFAULT 0,
  top_queries_json JSON,
  facet_clicks_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_music_search_daily_metrics_v48_date (metric_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS music_search_weekly_reports_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_id VARCHAR(128) NOT NULL,
  week_start DATE NOT NULL,
  report_status VARCHAR(64) NOT NULL DEFAULT 'draft',
  zero_result_terms_json JSON,
  recommendations_json JSON,
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_music_search_weekly_reports_v48_report (report_id),
  KEY idx_music_search_weekly_reports_v48_week (week_start, report_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS music_search_alert_notifications_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  notification_id VARCHAR(128) NOT NULL,
  rule_id VARCHAR(128) NOT NULL,
  severity VARCHAR(32) NOT NULL DEFAULT 'warning',
  metric_value DECIMAL(12,4),
  notification_status VARCHAR(64) NOT NULL DEFAULT 'pending',
  notification_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_music_search_alert_notifications_v48_notification (notification_id),
  KEY idx_music_search_alert_notifications_v48_rule (rule_id, severity, notification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS authority_candidate_merge_groups_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  merge_group_id VARCHAR(128) NOT NULL,
  adapter_id VARCHAR(128) NOT NULL,
  similarity_score DECIMAL(6,4) NOT NULL DEFAULT 0,
  recommended_action VARCHAR(96) NOT NULL,
  candidate_ids_json JSON,
  citation_completeness VARCHAR(96) NOT NULL DEFAULT 'needs_human_check',
  public_auto_release BOOLEAN NOT NULL DEFAULT FALSE,
  merge_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_authority_candidate_merge_groups_v48_group (merge_group_id),
  KEY idx_authority_candidate_merge_groups_v48_adapter (adapter_id, recommended_action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS authority_candidate_merge_decisions_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  decision_id VARCHAR(128) NOT NULL,
  merge_group_id VARCHAR(128) NOT NULL,
  reviewer_id VARCHAR(190) NOT NULL,
  decision VARCHAR(96) NOT NULL,
  request_hash VARCHAR(128) NOT NULL,
  decision_json JSON,
  public_auto_release BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_authority_candidate_merge_decisions_v48_decision (decision_id),
  KEY idx_authority_candidate_merge_decisions_v48_group (merge_group_id, decision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_model_visualization_reports_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_id VARCHAR(128) NOT NULL,
  experiment_id VARCHAR(128) NOT NULL,
  chart_type VARCHAR(96) NOT NULL,
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_model_visualization_reports_v48_report (report_id),
  KEY idx_speech_model_visualization_reports_v48_exp (experiment_id, chart_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS speech_model_export_artifacts_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  artifact_id VARCHAR(128) NOT NULL,
  experiment_id VARCHAR(128),
  artifact_format VARCHAR(64) NOT NULL,
  storage_uri TEXT,
  export_status VARCHAR(64) NOT NULL DEFAULT 'contract_ready',
  artifact_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_model_export_artifacts_v48_artifact (artifact_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS site_visual_audit_results_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  audit_id VARCHAR(128) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  day_mode_status VARCHAR(64) NOT NULL DEFAULT 'not_run',
  night_mode_status VARCHAR(64) NOT NULL DEFAULT 'not_run',
  og_status VARCHAR(64) NOT NULL DEFAULT 'not_run',
  metadata_guard_status VARCHAR(64) NOT NULL DEFAULT 'not_run',
  audit_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_site_visual_audit_results_v48_audit (audit_id),
  KEY idx_site_visual_audit_results_v48_route (route_path, day_mode_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS site_sitemap_ping_runs_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ping_id VARCHAR(128) NOT NULL,
  sitemap_url TEXT NOT NULL,
  ping_target VARCHAR(128) NOT NULL,
  ping_status VARCHAR(64) NOT NULL DEFAULT 'not_run',
  response_status INT,
  ping_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_site_sitemap_ping_runs_v48_ping (ping_id),
  KEY idx_site_sitemap_ping_runs_v48_target (ping_target, ping_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS core_web_vitals_preflight_v48 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_id VARCHAR(128) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  lcp_ms INT,
  cls_score DECIMAL(8,4),
  inp_ms INT,
  status VARCHAR(64) NOT NULL DEFAULT 'not_run',
  run_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_core_web_vitals_preflight_v48_run (run_id),
  KEY idx_core_web_vitals_preflight_v48_route (route_path, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
