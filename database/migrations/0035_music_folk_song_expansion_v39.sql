-- v39 folk song / song / old tune expansion metadata layer
CREATE TABLE IF NOT EXISTS music_source_candidates_v39 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_id VARCHAR(96) NOT NULL UNIQUE,
  title_zh VARCHAR(512) NOT NULL,
  artist_or_source VARCHAR(255),
  work_type VARCHAR(128),
  source_ids JSON NOT NULL,
  rights_status VARCHAR(64) NOT NULL DEFAULT 'unknown_needs_review',
  review_status VARCHAR(64) NOT NULL DEFAULT 'candidate_needs_authoritative_review',
  sensitivity VARCHAR(32) NOT NULL DEFAULT 'low',
  no_lyrics BOOLEAN NOT NULL DEFAULT TRUE,
  no_audio_download BOOLEAN NOT NULL DEFAULT TRUE,
  no_model_training BOOLEAN NOT NULL DEFAULT TRUE,
  dedupe_key VARCHAR(128) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_claims_v39 (
  claim_id VARCHAR(96) PRIMARY KEY,
  category VARCHAR(128) NOT NULL,
  statement_zh TEXT NOT NULL,
  source_ids JSON NOT NULL,
  canonical_fingerprint VARCHAR(128) NOT NULL,
  review_status VARCHAR(64) NOT NULL,
  sensitivity VARCHAR(32) NOT NULL,
  public_use VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_review_queue_v39 (
  review_id VARCHAR(96) PRIMARY KEY,
  song_id VARCHAR(96) NOT NULL,
  title_zh VARCHAR(512) NOT NULL,
  priority VARCHAR(32) NOT NULL,
  checks_required JSON NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_youtube_metadata_runs_v39 (
  run_id VARCHAR(96) PRIMARY KEY,
  seed_query VARCHAR(512) NOT NULL,
  status VARCHAR(64) NOT NULL,
  results_count INT NOT NULL DEFAULT 0,
  blocked_relation_hits JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
