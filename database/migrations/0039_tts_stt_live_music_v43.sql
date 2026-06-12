-- v43 TTS/STT live music search and model experiment layer
CREATE TABLE IF NOT EXISTS speech_authorization_reviews_v43 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  asset_id VARCHAR(128) NOT NULL,
  license_status VARCHAR(64) NOT NULL DEFAULT 'needs_review',
  speaker_consent_status VARCHAR(64) NOT NULL DEFAULT 'needs_review',
  dialect_code VARCHAR(64),
  alignment_status VARCHAR(64) NOT NULL DEFAULT 'needs_alignment',
  review_status VARCHAR(64) NOT NULL DEFAULT 'candidate',
  reviewer VARCHAR(190),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_model_experiments_v43 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  model_type VARCHAR(32) NOT NULL,
  dataset_version VARCHAR(128) NOT NULL,
  model_version VARCHAR(128),
  status VARCHAR(64) NOT NULL DEFAULT 'experiment_only',
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  model_card_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_evaluation_reports_v43 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  experiment_id BIGINT,
  metric_name VARCHAR(32) NOT NULL,
  metric_value DECIMAL(8,4),
  threshold_value DECIMAL(8,4),
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  evaluator VARCHAR(190),
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_search_live_queries_v43 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  query_text VARCHAR(512),
  facets_json JSON,
  result_count INT NOT NULL DEFAULT 0,
  blocked_terms_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_source_fetch_runs_v43 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  adapter_id VARCHAR(128) NOT NULL,
  mode VARCHAR(64) NOT NULL DEFAULT 'candidate_only',
  status VARCHAR(64) NOT NULL DEFAULT 'started',
  candidate_count INT NOT NULL DEFAULT 0,
  blocked_count INT NOT NULL DEFAULT 0,
  report_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_source_candidates_v43 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_run_id BIGINT,
  source_url TEXT,
  source_title VARCHAR(512),
  publisher VARCHAR(255),
  rights_status VARCHAR(64) NOT NULL DEFAULT 'unknown',
  review_status VARCHAR(64) NOT NULL DEFAULT 'candidate_needs_human_review',
  candidate_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ai_music_speech_guardrail_events_v43 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_hash VARCHAR(128),
  blocked_terms_json JSON,
  lyrics_risk BOOLEAN NOT NULL DEFAULT FALSE,
  has_claim_ids BOOLEAN NOT NULL DEFAULT FALSE,
  has_source_ids BOOLEAN NOT NULL DEFAULT FALSE,
  accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
