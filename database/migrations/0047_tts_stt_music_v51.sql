
-- v51: real VPS cutover seal, evidence upload, search A/B run, authority live metadata publication, model PDF renderer, Lighthouse/CWV validation
CREATE TABLE IF NOT EXISTS production_cutover_seal_reports_v51 (
  seal_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  environment VARCHAR(64) NOT NULL,
  status VARCHAR(64) NOT NULL,
  evidence_hash CHAR(64) NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  seal_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_cutover_seal_v51_idem (actor_id, idempotency_key)
);
CREATE TABLE IF NOT EXISTS production_cutover_restore_drills_v51 (
  drill_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  backup_id VARCHAR(128) NOT NULL,
  result VARCHAR(64) NOT NULL,
  duration_seconds INT DEFAULT 0,
  checksum CHAR(64),
  drill_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS production_cutover_observations_v51 (
  observation_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  metric_name VARCHAR(128) NOT NULL,
  metric_value DECIMAL(12,3) DEFAULT 0,
  status VARCHAR(64) NOT NULL,
  observation_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS audit_evidence_uploads_v51 (
  upload_id VARCHAR(128) PRIMARY KEY,
  queue_id VARCHAR(96) NOT NULL,
  asset_id VARCHAR(96) NOT NULL,
  actor_id VARCHAR(128) NOT NULL,
  evidence_type VARCHAR(64) NOT NULL,
  file_hash CHAR(64) NOT NULL,
  storage_uri TEXT NOT NULL,
  scan_status VARCHAR(64) DEFAULT 'pending',
  chain_hash CHAR(64),
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  upload_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_evidence_upload_v51 (queue_id, evidence_type, file_hash)
);
CREATE TABLE IF NOT EXISTS audit_evidence_attachment_scans_v51 (
  scan_id VARCHAR(128) PRIMARY KEY,
  upload_id VARCHAR(128) NOT NULL,
  actor_id VARCHAR(128) NOT NULL,
  scanner VARCHAR(128) NOT NULL,
  scan_status VARCHAR(64) NOT NULL,
  scan_hash CHAR(64) NOT NULL,
  scan_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_evidence_scan_v51_upload (upload_id)
);
CREATE TABLE IF NOT EXISTS audit_evidence_chain_seals_v51 (
  seal_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  asset_id VARCHAR(96) NOT NULL,
  chain_hash CHAR(64) NOT NULL,
  required_types_complete BOOLEAN NOT NULL DEFAULT FALSE,
  seal_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_search_ab_exposures_v51 (
  exposure_id VARCHAR(128) PRIMARY KEY,
  test_id VARCHAR(128) NOT NULL,
  variant VARCHAR(64) NOT NULL,
  query_hash CHAR(64) NOT NULL,
  session_hash CHAR(64) NOT NULL,
  exposure_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_music_ab_v51_test (test_id, variant)
);
CREATE TABLE IF NOT EXISTS music_search_ab_metrics_v51 (
  metric_id VARCHAR(128) PRIMARY KEY,
  test_id VARCHAR(128) NOT NULL,
  variant VARCHAR(64) NOT NULL,
  metric_name VARCHAR(128) NOT NULL,
  metric_value DECIMAL(12,4) DEFAULT 0,
  metric_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_search_synonym_merges_v51 (
  merge_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  task_id VARCHAR(128) NOT NULL,
  decision VARCHAR(64) NOT NULL,
  approved_terms_json JSON,
  auto_apply_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  merge_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_metadata_live_publications_v51 (
  publication_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  citation_complete BOOLEAN NOT NULL DEFAULT FALSE,
  rights_approved BOOLEAN NOT NULL DEFAULT FALSE,
  public_audio_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  public_lyrics_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  publication_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_metadata_source_notices_v51 (
  notice_id VARCHAR(128) PRIMARY KEY,
  source_id VARCHAR(128) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  detected_at VARCHAR(64),
  notice_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_metadata_card_hides_v51 (
  hide_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  publication_id VARCHAR(128) NOT NULL,
  reason TEXT NOT NULL,
  hidden_from_public BOOLEAN NOT NULL DEFAULT TRUE,
  hide_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_model_governance_pdf_renders_v51 (
  render_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  renderer VARCHAR(64) NOT NULL,
  status VARCHAR(64) NOT NULL,
  artifact_path TEXT,
  watermark VARCHAR(128),
  render_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_model_governance_signoff_stamps_v51 (
  stamp_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  role VARCHAR(64) NOT NULL,
  decision VARCHAR(64) NOT NULL,
  stamp_hash CHAR(64) NOT NULL,
  stamp_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_model_version_comparisons_v51 (
  comparison_id VARCHAR(128) PRIMARY KEY,
  from_version VARCHAR(96) NOT NULL,
  to_version VARCHAR(96) NOT NULL,
  diff_hash CHAR(64) NOT NULL,
  comparison_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_lighthouse_runs_v51 (
  run_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  lcp_ms INT,
  inp_ms INT,
  cls DECIMAL(6,3),
  status VARCHAR(64) NOT NULL,
  run_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_contrast_fixes_v51 (
  fix_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  mode VARCHAR(32) NOT NULL,
  before_ratio DECIMAL(6,2),
  after_ratio DECIMAL(6,2),
  fix_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_og_sitemap_pings_v51 (
  ping_id VARCHAR(128) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  og_ok BOOLEAN DEFAULT FALSE,
  sitemap_ok BOOLEAN DEFAULT FALSE,
  ping_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
