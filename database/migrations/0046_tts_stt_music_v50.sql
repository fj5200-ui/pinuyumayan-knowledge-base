
-- v50: production cutover, immutable evidence chain, search intelligence, authority publication, model delivery, brand completion
CREATE TABLE IF NOT EXISTS production_cutover_runs_v50 (
  run_id VARCHAR(128) PRIMARY KEY,
  deployment_mode VARCHAR(64) NOT NULL,
  status VARCHAR(64) NOT NULL,
  git_sha VARCHAR(80),
  artifact_sha256 CHAR(64),
  traffic_weight INT DEFAULT 0,
  release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  run_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS production_cutover_health_checks_v50 (
  check_result_id VARCHAR(128) PRIMARY KEY,
  run_id VARCHAR(128) NOT NULL,
  check_id VARCHAR(96) NOT NULL,
  path VARCHAR(255) NOT NULL,
  status_code INT,
  healthy BOOLEAN NOT NULL DEFAULT FALSE,
  latency_ms INT DEFAULT 0,
  check_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cutover_health_v50_run (run_id)
);
CREATE TABLE IF NOT EXISTS production_cutover_dns_events_v50 (
  event_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  zone_id VARCHAR(128),
  dns_record_id VARCHAR(128),
  old_value TEXT,
  new_value TEXT,
  ttl_seconds INT,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  event_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS production_rollback_rehearsals_v50 (
  rehearsal_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  backup_id VARCHAR(128) NOT NULL,
  previous_artifact_sha256 CHAR(64),
  duration_seconds INT DEFAULT 0,
  result VARCHAR(64) NOT NULL,
  rehearsal_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS audit_evidence_store_v50 (
  evidence_id VARCHAR(128) PRIMARY KEY,
  queue_id VARCHAR(96) NOT NULL,
  asset_id VARCHAR(96) NOT NULL,
  evidence_type VARCHAR(64) NOT NULL,
  evidence_hash CHAR(64) NOT NULL,
  chain_hash CHAR(64) NOT NULL,
  previous_chain_hash CHAR(64),
  storage_uri TEXT,
  scan_status VARCHAR(64) DEFAULT 'pending',
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  evidence_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_audit_evidence_v50_idem (queue_id, evidence_type, evidence_hash)
);
CREATE TABLE IF NOT EXISTS audit_evidence_signoffs_v50 (
  signoff_id VARCHAR(128) PRIMARY KEY,
  evidence_id VARCHAR(128) NOT NULL,
  actor_id VARCHAR(128) NOT NULL,
  signoff_role VARCHAR(64) NOT NULL,
  decision VARCHAR(64) NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  signoff_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_evidence_signoff_v50 (evidence_id, actor_id, idempotency_key)
);
CREATE TABLE IF NOT EXISTS audit_evidence_export_jobs_v50 (
  export_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  export_format VARCHAR(32) NOT NULL,
  scope VARCHAR(64) NOT NULL,
  status VARCHAR(64) NOT NULL,
  artifact_path TEXT,
  export_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_search_synonym_review_tasks_v50 (
  task_id VARCHAR(128) PRIMARY KEY,
  source_suggestion_id VARCHAR(128),
  query_text VARCHAR(255) NOT NULL,
  candidate_terms_json JSON,
  decision VARCHAR(64) NOT NULL DEFAULT 'pending_human_review',
  reviewer_id VARCHAR(128),
  auto_apply_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  task_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_search_ltr_weights_v50 (
  weight_id VARCHAR(128) PRIMARY KEY,
  feature_name VARCHAR(128) NOT NULL,
  weight_value DECIMAL(6,4) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'draft',
  weight_json JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_search_ab_tests_v50 (
  test_id VARCHAR(128) PRIMARY KEY,
  variant_a VARCHAR(128) NOT NULL,
  variant_b VARCHAR(128) NOT NULL,
  traffic_percent INT NOT NULL DEFAULT 0,
  status VARCHAR(64) NOT NULL,
  result_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_search_intent_classifications_v50 (
  classification_id VARCHAR(128) PRIMARY KEY,
  query_text VARCHAR(255) NOT NULL,
  intent VARCHAR(128) NOT NULL,
  confidence DECIMAL(5,2) DEFAULT 0,
  route_target VARCHAR(128),
  classification_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_metadata_publication_queue_v50 (
  publication_id VARCHAR(128) PRIMARY KEY,
  candidate_id VARCHAR(128) NOT NULL,
  publish_mode VARCHAR(64) NOT NULL DEFAULT 'metadata_only',
  status VARCHAR(64) NOT NULL,
  citation_score INT DEFAULT 0,
  public_audio_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  public_lyrics_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  publication_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_metadata_citation_formats_v50 (
  format_id VARCHAR(128) PRIMARY KEY,
  style VARCHAR(128) NOT NULL,
  template TEXT NOT NULL,
  required_fields_json JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_metadata_takedown_requests_v50 (
  request_id VARCHAR(128) PRIMARY KEY,
  publication_id VARCHAR(128) NOT NULL,
  requester_contact VARCHAR(255),
  reason TEXT,
  status VARCHAR(64) NOT NULL DEFAULT 'received',
  hidden_from_public BOOLEAN NOT NULL DEFAULT FALSE,
  request_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_source_change_notifications_v50 (
  notification_id VARCHAR(128) PRIMARY KEY,
  source_id VARCHAR(128) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  etag VARCHAR(255),
  last_modified VARCHAR(255),
  notification_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_model_governance_delivery_exports_v50 (
  export_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  export_format VARCHAR(32) NOT NULL,
  status VARCHAR(64) NOT NULL,
  artifact_path TEXT,
  watermark VARCHAR(128),
  export_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_model_version_diffs_v50 (
  diff_id VARCHAR(128) PRIMARY KEY,
  from_version VARCHAR(96) NOT NULL,
  to_version VARCHAR(96) NOT NULL,
  change_summary TEXT,
  risk VARCHAR(64),
  diff_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_model_release_blocker_closures_v50 (
  closure_id VARCHAR(128) PRIMARY KEY,
  blocker_id VARCHAR(128) NOT NULL,
  actor_id VARCHAR(128) NOT NULL,
  closure_status VARCHAR(64) NOT NULL,
  affected_assets INT DEFAULT 0,
  closure_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_brand_completion_routes_v50 (
  route_id VARCHAR(128) PRIMARY KEY,
  route_path VARCHAR(255) NOT NULL,
  day_mode_status VARCHAR(64),
  night_mode_status VARCHAR(64),
  screenshot_required BOOLEAN NOT NULL DEFAULT TRUE,
  og_required BOOLEAN NOT NULL DEFAULT TRUE,
  route_json JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_browser_screenshot_validations_v50 (
  validation_id VARCHAR(128) PRIMARY KEY,
  route_path VARCHAR(255) NOT NULL,
  viewport VARCHAR(64) NOT NULL,
  mode VARCHAR(32) NOT NULL,
  screenshot_path TEXT,
  status VARCHAR(64) NOT NULL,
  validation_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_seo_og_monitors_v50 (
  monitor_id VARCHAR(128) PRIMARY KEY,
  route_path VARCHAR(255) NOT NULL,
  status VARCHAR(64) NOT NULL,
  title_ok BOOLEAN DEFAULT FALSE,
  description_ok BOOLEAN DEFAULT FALSE,
  og_image_ok BOOLEAN DEFAULT FALSE,
  json_ld_ok BOOLEAN DEFAULT FALSE,
  monitor_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_core_web_vitals_runs_v50 (
  run_id VARCHAR(128) PRIMARY KEY,
  route_path VARCHAR(255) NOT NULL,
  lcp_ms INT,
  inp_ms INT,
  cls DECIMAL(6,3),
  status VARCHAR(64) NOT NULL,
  run_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
