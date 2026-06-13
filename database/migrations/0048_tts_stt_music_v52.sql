-- v52: real go-live execution, evidence chain opening, A/B convergence, metadata release, model signoff, brand monitoring
CREATE TABLE IF NOT EXISTS production_go_live_steps_v52 (
  step_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  environment VARCHAR(64) NOT NULL,
  status VARCHAR(64) NOT NULL,
  evidence_bundle_hash CHAR(64) NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  release_blocking BOOLEAN NOT NULL DEFAULT TRUE,
  step_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_go_live_step_v52_idem (actor_id, idempotency_key)
);
CREATE TABLE IF NOT EXISTS production_go_live_rollback_evidence_v52 (
  rollback_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  environment VARCHAR(64) NOT NULL,
  rollback_status VARCHAR(64) NOT NULL,
  artifact_sha256 CHAR(64),
  rollback_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS production_go_live_observations_v52 (
  sample_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  environment VARCHAR(64) NOT NULL,
  minute_mark INT NOT NULL,
  health_ok BOOLEAN NOT NULL DEFAULT FALSE,
  p95_latency_ms INT DEFAULT 0,
  error_rate DECIMAL(8,5) DEFAULT 0,
  sample_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS production_release_seals_v52 (
  seal_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  evidence_bundle_hash CHAR(64) NOT NULL,
  release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  seal_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS audit_evidence_slots_v52 (
  slot_id VARCHAR(128) PRIMARY KEY,
  queue_id VARCHAR(96) NOT NULL,
  asset_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(128) NOT NULL,
  evidence_type VARCHAR(64) NOT NULL,
  upload_url TEXT,
  expires_at VARCHAR(64),
  slot_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS audit_evidence_scans_v52 (
  scan_id VARCHAR(128) PRIMARY KEY,
  slot_id VARCHAR(128) NOT NULL,
  actor_id VARCHAR(128) NOT NULL,
  scanner VARCHAR(128) NOT NULL,
  scan_status VARCHAR(64) NOT NULL,
  file_hash CHAR(64) NOT NULL,
  scan_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS audit_asset_evidence_seals_v52 (
  seal_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  asset_id VARCHAR(96) NOT NULL,
  chain_hash CHAR(64) NOT NULL,
  required_types_complete BOOLEAN NOT NULL DEFAULT FALSE,
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  seal_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS audit_training_batches_v52 (
  batch_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  eligible_asset_count INT NOT NULL DEFAULT 0,
  speaker_leakage_check_passed BOOLEAN NOT NULL DEFAULT FALSE,
  export_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  batch_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_search_ab_convergence_metrics_v52 (
  metric_id VARCHAR(128) PRIMARY KEY,
  test_id VARCHAR(128) NOT NULL,
  variant VARCHAR(64) NOT NULL,
  sample_size INT NOT NULL DEFAULT 0,
  zero_result_recovery_rate DECIMAL(10,4) DEFAULT 0,
  p95_latency_ms INT DEFAULT 0,
  metric_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_search_variant_decisions_v52 (
  decision_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  test_id VARCHAR(128) NOT NULL,
  decision VARCHAR(64) NOT NULL,
  auto_rollout_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  decision_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_search_variant_rollouts_v52 (
  rollout_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  variant VARCHAR(64) NOT NULL,
  rollout_percent INT NOT NULL DEFAULT 0,
  status VARCHAR(64) NOT NULL,
  rollout_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_metadata_release_approvals_v52 (
  approval_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  publication_id VARCHAR(128) NOT NULL,
  rights_approved BOOLEAN NOT NULL DEFAULT FALSE,
  citation_score INT NOT NULL DEFAULT 0,
  approval_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_metadata_index_jobs_v52 (
  index_job_id VARCHAR(128) PRIMARY KEY,
  publication_id VARCHAR(128) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  index_status VARCHAR(64) NOT NULL,
  index_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_metadata_takedowns_v52 (
  takedown_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  publication_id VARCHAR(128) NOT NULL,
  reason TEXT NOT NULL,
  hidden_from_public BOOLEAN NOT NULL DEFAULT TRUE,
  takedown_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_model_watermarked_pdfs_v52 (
  pdf_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  renderer VARCHAR(128) NOT NULL,
  artifact_path TEXT NOT NULL,
  watermark TEXT NOT NULL,
  status VARCHAR(64) NOT NULL,
  pdf_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_model_lineage_graphs_v52 (
  graph_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  graph_hash CHAR(64) NOT NULL,
  node_count INT DEFAULT 0,
  graph_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_model_release_blockers_v52 (
  blocker_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  blocker_status VARCHAR(64) NOT NULL,
  reason TEXT NOT NULL,
  blocker_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_lighthouse_cwv_runs_v52 (
  run_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  lcp_ms INT DEFAULT 0,
  inp_ms INT DEFAULT 0,
  cls DECIMAL(8,4) DEFAULT 0,
  performance_score INT DEFAULT 0,
  accessibility_score INT DEFAULT 0,
  status VARCHAR(64) NOT NULL,
  run_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_browser_screenshots_v52 (
  screenshot_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  viewport VARCHAR(64) NOT NULL,
  screenshot_hash CHAR(64) NOT NULL,
  screenshot_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_og_sitemap_checks_v52 (
  check_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  og_ok BOOLEAN NOT NULL DEFAULT FALSE,
  sitemap_ok BOOLEAN NOT NULL DEFAULT FALSE,
  check_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
