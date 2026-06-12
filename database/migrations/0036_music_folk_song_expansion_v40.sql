-- v40 music folk song expansion with YouTube metadata candidate worker
CREATE TABLE IF NOT EXISTS music_youtube_candidates_v40 (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_id VARCHAR(96) NOT NULL UNIQUE,
  source_url TEXT NOT NULL,
  video_id VARCHAR(64),
  title VARCHAR(512) NOT NULL,
  channel_title VARCHAR(255),
  channel_id VARCHAR(128),
  published_at DATETIME NULL,
  duration_iso8601 VARCHAR(64),
  thumbnail_url TEXT,
  description_hash VARCHAR(128),
  rights_status VARCHAR(64) NOT NULL DEFAULT 'unknown_needs_review',
  official_channel_guess BOOLEAN NOT NULL DEFAULT FALSE,
  sensitivity_guess VARCHAR(32) NOT NULL DEFAULT 'low',
  blocked_relation_hits JSON NULL,
  review_status VARCHAR(64) NOT NULL DEFAULT 'candidate_needs_review',
  dedupe_key VARCHAR(128) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_source_candidates_v40 (
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
CREATE TABLE IF NOT EXISTS music_claims_v40 (
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
CREATE TABLE IF NOT EXISTS music_review_queue_v40 (
  review_id VARCHAR(96) PRIMARY KEY,
  song_id VARCHAR(96) NOT NULL,
  title_zh VARCHAR(512) NOT NULL,
  priority VARCHAR(32) NOT NULL,
  checks_required JSON NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
