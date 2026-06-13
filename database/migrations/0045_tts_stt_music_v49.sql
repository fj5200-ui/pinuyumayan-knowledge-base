-- v49: deployment convergence, live review workbench, search optimization, authority citation, model export, site performance
CREATE TABLE IF NOT EXISTS vps_release_validation_runs_v49 (
  run_id VARCHAR(96) PRIMARY KEY,
  run_mode VARCHAR(64) NOT NULL,
  status VARCHAR(64) NOT NULL,
  migration_checksum CHAR(64),
  seed_checksum CHAR(64),
  backup_id VARCHAR(128),
  release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS vps_release_validation_checks_v49 (
  result_id VARCHAR(128) PRIMARY KEY,
  run_id VARCHAR(96) NOT NULL,
  check_id VARCHAR(96) NOT NULL,
  status VARCHAR(64) NOT NULL,
  severity VARCHAR(32) NOT NULL,
  evidence_url TEXT,
  check_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vps_release_validation_checks_v49_run (run_id)
);
CREATE TABLE IF NOT EXISTS vps_backup_restore_drills_v49 (
  drill_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  backup_id VARCHAR(128) NOT NULL,
  restore_target VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL,
  duration_seconds INT DEFAULT 0,
  drill_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_review_workbench_live_views_v49 (
  queue_id VARCHAR(96) PRIMARY KEY,
  asset_id VARCHAR(96) NOT NULL,
  assigned_reviewer VARCHAR(128),
  status VARCHAR(64) NOT NULL,
  attachment_scan_status VARCHAR(64) DEFAULT 'not_uploaded',
  role_visibility_json JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_review_workbench_live_actions_v49 (
  action_id VARCHAR(128) PRIMARY KEY,
  queue_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(128) NOT NULL,
  action_type VARCHAR(64) NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  request_hash CHAR(64) NOT NULL,
  action_json JSON,
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_speech_review_live_action_v49 (queue_id, idempotency_key)
);
CREATE TABLE IF NOT EXISTS speech_review_attachment_scan_jobs_v49 (
  scan_job_id VARCHAR(128) PRIMARY KEY,
  queue_id VARCHAR(96) NOT NULL,
  attachment_id VARCHAR(128) NOT NULL,
  actor_id VARCHAR(128) NOT NULL,
  scan_status VARCHAR(64) NOT NULL,
  scanner VARCHAR(128),
  scan_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_review_batch_progress_v49 (
  batch_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL,
  total_count INT NOT NULL DEFAULT 0,
  processed_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  progress_json JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_search_synonym_suggestions_v49 (
  suggestion_id VARCHAR(128) PRIMARY KEY,
  source_query VARCHAR(255) NOT NULL,
  suggested_terms_json JSON,
  confidence DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(64) NOT NULL DEFAULT 'pending_review',
  reviewer_id VARCHAR(128),
  applied BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_search_zero_result_tasks_v49 (
  task_id VARCHAR(128) PRIMARY KEY,
  query_text VARCHAR(255) NOT NULL,
  occurrence_count INT DEFAULT 0,
  recommended_action VARCHAR(128),
  owner VARCHAR(128),
  status VARCHAR(64) NOT NULL DEFAULT 'open',
  task_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_search_regression_runs_v49 (
  run_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128),
  status VARCHAR(64) NOT NULL,
  cases_total INT DEFAULT 0,
  cases_passed INT DEFAULT 0,
  cases_failed INT DEFAULT 0,
  run_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_citation_completeness_scores_v49 (
  score_id VARCHAR(128) PRIMARY KEY,
  candidate_id VARCHAR(128) NOT NULL,
  citation_score INT NOT NULL DEFAULT 0,
  rights_statement_score INT NOT NULL DEFAULT 0,
  metadata_completeness_score INT NOT NULL DEFAULT 0,
  publish_recommendation VARCHAR(128),
  public_audio_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  public_lyrics_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  score_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_rights_statement_diffs_v49 (
  diff_id VARCHAR(128) PRIMARY KEY,
  candidate_id VARCHAR(128) NOT NULL,
  old_statement TEXT,
  new_statement TEXT,
  review_required BOOLEAN NOT NULL DEFAULT TRUE,
  diff_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_source_change_events_v49 (
  event_id VARCHAR(128) PRIMARY KEY,
  source_id VARCHAR(128) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  etag VARCHAR(255),
  last_modified VARCHAR(255),
  event_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_model_governance_exports_v49 (
  export_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  export_format VARCHAR(32) NOT NULL,
  status VARCHAR(64) NOT NULL,
  artifact_path TEXT,
  export_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_model_release_blocker_summaries_v49 (
  blocker_id VARCHAR(128) PRIMARY KEY,
  reason VARCHAR(255) NOT NULL,
  affected_assets INT NOT NULL DEFAULT 0,
  auto_unblock_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  required_action TEXT,
  blocker_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_design_system_tokens_v49 (
  token_id VARCHAR(128) PRIMARY KEY,
  token_group VARCHAR(64) NOT NULL,
  token_name VARCHAR(128) NOT NULL,
  token_value VARCHAR(255) NOT NULL,
  token_json JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_performance_validation_runs_v49 (
  run_id VARCHAR(128) PRIMARY KEY,
  route_path VARCHAR(255) NOT NULL,
  lcp_ms INT,
  inp_ms INT,
  cls DECIMAL(6,3),
  status VARCHAR(64) NOT NULL,
  run_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_og_screenshot_validations_v49 (
  validation_id VARCHAR(128) PRIMARY KEY,
  route_path VARCHAR(255) NOT NULL,
  screenshot_path TEXT,
  status VARCHAR(64) NOT NULL,
  validation_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
