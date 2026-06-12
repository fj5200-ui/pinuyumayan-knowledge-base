-- v42 TTS/STT evaluation, music search, authority candidate source layer
CREATE TABLE IF NOT EXISTS speech_dataset_review_reports_v42 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_hash VARCHAR(128) NOT NULL,
  candidate_count INT NOT NULL DEFAULT 0,
  train_ready_count INT NOT NULL DEFAULT 0,
  blocked_count INT NOT NULL DEFAULT 0,
  decision VARCHAR(64) NOT NULL DEFAULT 'candidate_only',
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_evaluation_reports_v42 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  model_id VARCHAR(128) NOT NULL,
  dataset_version VARCHAR(64) NOT NULL,
  mos DECIMAL(4,2) NULL,
  wer DECIMAL(6,4) NULL,
  cer DECIMAL(6,4) NULL,
  public_release_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS speech_alignment_review_items_v42 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  asset_id VARCHAR(128) NOT NULL,
  dialect_code VARCHAR(32) NULL,
  license_status VARCHAR(64) NOT NULL DEFAULT 'unknown',
  speaker_consent_status VARCHAR(64) NOT NULL DEFAULT 'unknown',
  alignment_status VARCHAR(64) NOT NULL DEFAULT 'missing',
  review_status VARCHAR(64) NOT NULL DEFAULT 'candidate_needs_review',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_speech_alignment_asset_v42 (asset_id)
);
CREATE TABLE IF NOT EXISTS music_search_query_logs_v42 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  query_text VARCHAR(512) NOT NULL,
  result_count INT NOT NULL DEFAULT 0,
  facets JSON NULL,
  blocked_terms JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_fulltext_population_runs_v42 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  run_hash VARCHAR(128) NOT NULL,
  row_count INT NOT NULL DEFAULT 0,
  checksum VARCHAR(128) NULL,
  blocked_term_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_source_fetch_runs_v42 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  adapter_key VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'candidate',
  fetched_count INT NOT NULL DEFAULT 0,
  accepted_candidate_count INT NOT NULL DEFAULT 0,
  blocked_count INT NOT NULL DEFAULT 0,
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS authority_source_candidates_v42 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_url TEXT NOT NULL,
  title VARCHAR(512) NOT NULL,
  publisher VARCHAR(255) NULL,
  rights_status VARCHAR(64) NOT NULL DEFAULT 'unknown',
  review_status VARCHAR(64) NOT NULL DEFAULT 'candidate_needs_review',
  forbidden_relation_flag BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ai_music_speech_grounding_checks_v42 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  draft_hash VARCHAR(128) NOT NULL,
  has_claim_ids BOOLEAN NOT NULL DEFAULT FALSE,
  has_source_ids BOOLEAN NOT NULL DEFAULT FALSE,
  blocked_terms JSON NULL,
  lyrics_risk BOOLEAN NOT NULL DEFAULT FALSE,
  accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
